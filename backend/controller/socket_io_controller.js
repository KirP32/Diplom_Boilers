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
        `INSERT INTO request_confirmations (request_id, user_confirmed, worker_confirmed)
         VALUES ($1, $2, $3)`,
        [request_id, access_level === 0, access_level === 1]
      );
    } else {
      const { user_confirmed, worker_confirmed } = result.rows[0];

      if (access_level === 0) {
        await pool.query(
          `UPDATE request_confirmations SET user_confirmed = !user_confirmed WHERE request_id = $1`,
          [request_id]
        );
      } else if (access_level === 1) {
        await pool.query(
          `UPDATE request_confirmations SET worker_confirmed = !worker_confirmed WHERE request_id = $1`,
          [request_id]
        );
      }
    }

    // Получаем обновленные данные подтверждения
    const updatedResult = await pool.query(
      `SELECT * FROM request_confirmations WHERE request_id = $1`,
      [request_id]
    );

    let { user_confirmed, worker_confirmed } = updatedResult.rows[0];

    // Если оба подтвердили, двигаем стадию
    if (user_confirmed && worker_confirmed) {
      const stageResult = await pool.query(
        `SELECT stage FROM user_requests WHERE id = $1`,
        [request_id]
      );
      let currentStage = stageResult.rows[0].stage;
      let newStage = currentStage;

      if (action === "next") {
        console.log("next");
        newStage = currentStage + 1;

        if (newStage >= max_stage) {
          newStage = max_stage;
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
        console.log("prev");
        newStage = currentStage - 1;

        if (newStage < 0) {
          return {
            success: true,
            user_confirmed,
            worker_confirmed,
            stage: currentStage,
            status,
          };
        }

        await pool.query(`UPDATE user_requests SET stage = $1 WHERE id = $2`, [
          newStage,
          request_id,
        ]);
      }

      // Сбрасываем подтверждения
      await pool.query(
        `UPDATE request_confirmations SET user_confirmed = FALSE, worker_confirmed = FALSE WHERE request_id = $1`,
        [request_id]
      );

      return {
        success: true,
        user_confirmed: false,
        worker_confirmed: false,
        stage: newStage,
        status: status,
      };
    } else {
      // Если только один подтвердил, просто возвращаем текущую стадию
      const stageResult = await pool.query(
        `SELECT stage FROM user_requests WHERE id = $1`,
        [request_id]
      );
      return {
        success: true,
        user_confirmed,
        worker_confirmed,
        stage: stageResult.rows[0].stage,
      };
    }
  } catch (error) {
    console.error("Ошибка при переходе на следующий этап:", error);
    return { error: "Ошибка при обработке запроса" };
  }
}

module.exports = { handleStage };
