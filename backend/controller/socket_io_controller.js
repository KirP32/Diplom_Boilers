const pool = require("../dataBase/pool");

async function handleStage(request_id, access_level, max_stage, action) {
  try {
    let status = 0;
    const result = await pool.query(
      `SELECT * FROM request_confirmations WHERE request_id = $1`,
      [request_id]
    );

    if (result.rows.length === 0) {
      await pool.query(
        `INSERT INTO request_confirmations 
         (request_id, user_confirmed, worker_confirmed, regional_confirmed, service_engineer_confirmed, action)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          request_id,
          access_level === 0, // user_confirmed
          access_level === 1, // worker_confirmed
          access_level === 2, // regional_confirmed
          access_level === 3, // service_engineer_confirmed
          action,
        ]
      );
    } else {
      if (access_level === 0) {
        await pool.query(
          `UPDATE request_confirmations 
           SET user_confirmed = NOT user_confirmed, action = $2 
           WHERE request_id = $1`,
          [request_id, action]
        );
      } else if (access_level === 1) {
        await pool.query(
          `UPDATE request_confirmations 
           SET worker_confirmed = NOT worker_confirmed, action = $2 
           WHERE request_id = $1`,
          [request_id, action]
        );
      } else if (access_level === 2) {
        await pool.query(
          `UPDATE request_confirmations 
           SET regional_confirmed = NOT regional_confirmed, action = $2 
           WHERE request_id = $1`,
          [request_id, action]
        );
      } else if (access_level === 3) {
        await pool.query(
          `UPDATE request_confirmations 
           SET service_engineer_confirmed = NOT service_engineer_confirmed, action = $2 
           WHERE request_id = $1`,
          [request_id, action]
        );
      }
    }

    const updatedResult = await pool.query(
      `SELECT * FROM request_confirmations WHERE request_id = $1`,
      [request_id]
    );
    const {
      user_confirmed,
      worker_confirmed,
      regional_confirmed,
      service_engineer_confirmed,
    } = updatedResult.rows[0];

    const requestResult = await pool.query(
      `SELECT created_by_worker, stage, assigned_to, region_assigned_to FROM user_requests WHERE id = $1`,
      [request_id]
    );
    const {
      created_by_worker,
      stage: currentStage,
      assigned_to,
      region_assigned_to,
    } = requestResult.rows[0];

    const allConfirmed = created_by_worker
      ? (worker_confirmed || assigned_to === null) &&
        (regional_confirmed || region_assigned_to === null) &&
        service_engineer_confirmed
      : user_confirmed &&
        (worker_confirmed || assigned_to === null) &&
        (regional_confirmed || region_assigned_to === null) &&
        service_engineer_confirmed;

    // console.log("worker_confirmed", worker_confirmed);
    // console.log("assigned_to", assigned_to);
    // console.log("regional_confirmed", regional_confirmed);
    // console.log("region_assigned_to", region_assigned_to);
    // console.log("service_engineer_confirmed", service_engineer_confirmed);
    if (allConfirmed) {
      let newStage = currentStage;

      if (action === "next") {
        newStage = currentStage + 1;
        if (newStage >= max_stage) {
          newStage = max_stage - 1;
          await pool.query(
            `UPDATE user_requests SET status = 1, stage = $1 WHERE id = $2`,
            [newStage, request_id]
          );
          status = 1;

          const { rows } = await pool.query(
            `SELECT assigned_to, system_name FROM user_requests WHERE id = $1`,
            [request_id]
          );
          if (rows.length > 0) {
            const { assigned_to, system_name } = rows[0];
            const countResult = await pool.query(
              `SELECT COUNT(*) FROM user_requests 
               WHERE assigned_to = $1 AND system_name = $2 AND status != 1`,
              [assigned_to, system_name]
            );
            if (Number(countResult.rows[0].count) === 0) {
              await pool.query(
                `DELETE FROM user_systems WHERE user_id = $1 AND name = $2`,
                [assigned_to, system_name]
              );
            }
          }
        } else {
          await pool.query(
            `UPDATE user_requests SET stage = $1 WHERE id = $2`,
            [newStage, request_id]
          );
        }
      } else if (action === "prev") {
        newStage = currentStage - 1;
        if (newStage < 0) {
          return {
            success: true,
            user_confirmed,
            worker_confirmed,
            regional_confirmed,
            service_engineer_confirmed,
            stage: currentStage,
            status,
            action,
          };
        }
        await pool.query(`UPDATE user_requests SET stage = $1 WHERE id = $2`, [
          newStage,
          request_id,
        ]);
      }

      await pool.query(
        `UPDATE request_confirmations 
         SET user_confirmed = FALSE, worker_confirmed = FALSE, regional_confirmed = FALSE, service_engineer_confirmed = FALSE, action = ''
         WHERE request_id = $1`,
        [request_id]
      );

      return {
        success: true,
        user_confirmed: false,
        worker_confirmed: false,
        regional_confirmed: false,
        service_engineer_confirmed: false,
        stage: newStage,
        status,
        action,
      };
    } else {
      return {
        success: true,
        user_confirmed,
        worker_confirmed,
        regional_confirmed,
        service_engineer_confirmed,
        stage: currentStage,
        status: 0,
        action,
      };
    }
  } catch (error) {
    console.error("Ошибка при переходе на следующий этап:", error);
    return { error: "Ошибка при обработке запроса" };
  }
}

module.exports = { handleStage };
