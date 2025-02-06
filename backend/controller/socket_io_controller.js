const pool = require("../dataBase/pool");

async function handleStage(request_id, access_level, max_stage, action) {
  try {
    console.log(action);
    let status = 0;

    const result = await pool.query(
      `SELECT * FROM request_confirmations WHERE request_id = $1`,
      [request_id]
    );

    if (result.rows.length === 0) {
      await pool.query(
        `INSERT INTO request_confirmations (request_id, user_confirmed, worker_confirmed, action)
         VALUES ($1, $2, $3, $4)`,
        [request_id, access_level === 0, access_level === 1, action]
      );
    } else {
      if (access_level === 0) {
        await pool.query(
          `UPDATE request_confirmations SET user_confirmed = NOT user_confirmed, action = $2 WHERE request_id = $1`,
          [request_id, action]
        );
      } else if (access_level === 1) {
        await pool.query(
          `UPDATE request_confirmations SET worker_confirmed = NOT worker_confirmed, action = $2 WHERE request_id = $1`,
          [request_id, action]
        );
      }
    }

    const updatedResult = await pool.query(
      `SELECT * FROM request_confirmations WHERE request_id = $1`,
      [request_id]
    );

    let { user_confirmed, worker_confirmed } = updatedResult.rows[0];

    if (user_confirmed && worker_confirmed) {
      const stageResult = await pool.query(
        `SELECT stage FROM user_requests WHERE id = $1`,
        [request_id]
      );
      let currentStage = stageResult.rows[0].stage;
      let newStage = currentStage;

      if (action === "next") {
        newStage = currentStage + 1;
        console.log(currentStage, newStage);
        if (newStage >= max_stage) {
          newStage = max_stage - 1;
          await pool.query(
            `UPDATE user_requests SET status = 1, stage = $1 WHERE id = $2`,
            [newStage, request_id]
          );
          status = 1;
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
        `UPDATE request_confirmations SET user_confirmed = FALSE, worker_confirmed = FALSE, action = '' WHERE request_id = $1`,
        [request_id]
      );

      return {
        success: true,
        user_confirmed: false,
        worker_confirmed: false,
        stage: newStage,
        status,
        action,
      };
    } else {
      const stageResult = await pool.query(
        `SELECT stage FROM user_requests WHERE id = $1`,
        [request_id]
      );
      return {
        success: true,
        user_confirmed,
        worker_confirmed,
        stage: stageResult.rows[0].stage,
        action,
      };
    }
  } catch (error) {
    console.error("Ошибка при переходе на следующий этап:", error);
    return { error: "Ошибка при обработке запроса" };
  }
}

module.exports = { handleStage };
