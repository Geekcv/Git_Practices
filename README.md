async function fetchCenterWiseStudents(req, res) {
  try {
    const {
      from_date,
      to_date,
      exam_sessions,
      center,
      gender,
      state,
      city,
      roll_no,
      orderby,
    } = req.data;

    // CASE 1: Filter by State or City
    if (state || city) {
      const orConditions = {};
      if (exam_sessions)
        orConditions[`${schema}.students.exam_sessions`] = exam_sessions;
      if (state) orConditions[`${schema}.students.state`] = state;
      if (city) orConditions[`${schema}.students.city`] = city;

      const parameters = {
        tablename: students,
        data: [
          `${students}.student_name`,
          `${students}.father_name`,
          `${students}.state`,
          `${students}.city`,
          `${students}.roll_no`,
          `${classes}.class_name`,
        ],
        cond: Object.keys(orConditions).length ? { AND: orConditions } : null,
        joins: [
          {
            jointype: "inner",
            tables: [
              { tb: students, on: "center" },
              { tb: centers, on: "row_id" },
            ],
          },
          {
            jointype: "inner",
            tables: [
              { tb: students, on: "class_id" },
              { tb: classes, on: "row_id" },
            ],
          },
        ],
      };

      const studentResp = await query.select_query(parameters);

      if (!studentResp?.length) {
        return libFunc.sendResponse(res, {
          status: 1,
          msg: "No students found for the given state/city filters.",
          data: [],
        });
      }

      return libFunc.sendResponse(res, {
        status: 0,
        msg: "Students filtered by state or city fetched successfully.",
        data: studentResp,
      });
    }

    // CASE 2: Filter by Roll Number
    else if (roll_no) {
      const cond = {
        AND: {
          [`${students}.exam_sessions`]: exam_sessions,
          [`${students}.center`]: center,
          [`${students}.roll_no`]: roll_no,
        },
      };

      const parameters = {
        tablename: students,
        data: [
          `${students}.student_name`,
          `${students}.father_name`,
          `${students}.address`,
          `${classes}.class_name`,
          `${students}.gender`,
          `${students}.roll_no`,
          `${students}.center`,
          `${centers}.center as center_name`,
          `${examSessions}.exam_date`,
        ],
        cond: cond,
        joins: [
          {
            jointype: "inner",
            tables: [
              { tb: students, on: "center" },
              { tb: centers, on: "row_id" },
            ],
          },
          {
            jointype: "inner",
            tables: [
              { tb: students, on: "class_id" },
              { tb: classes, on: "row_id" },
            ],
          },
          {
            jointype: "inner",
            tables: [
              { tb: students, on: "exam_sessions" },
              { tb: examSessions, on: "row_id" },
            ],
          },
        ],
      };

      const studentResp = await query.select_query(parameters);

      if (!studentResp?.length) {
        return libFunc.sendResponse(res, {
          status: 1,
          msg: "No student found for the given roll number.",
          data: [],
        });
      }

      return libFunc.sendResponse(res, {
        status: 0,
        msg: "Student details fetched successfully for the admission card.",
        data: studentResp,
      });
    }

    // CASE 3: Ordered Result
    else if (orderby) {
      let orderClause = { [`${students}.roll_no`]: "asc" };

      if (orderby === "name") {
        orderClause = {
          [`${students}.student_name`]: "asc",
          [`${classes}.class_name`]: "asc",
        };
      } else if (orderby === "roll_no") {
        orderClause = {
          [`${students}.roll_no`]: "asc",
          [`${classes}.class_name`]: "asc",
        };
      } else if (orderby === "both") {
        orderClause = {
          [`${students}.roll_no`]: "asc",
          [`${students}.student_name`]: "asc",
        };
      }

      const cond = {
        AND: {
          [`${students}.exam_sessions`]: exam_sessions,
          [`${students}.center`]: center,
        },
      };

      if (gender) cond.AND[`${students}.gender`] = gender;

      const parameters = {
        tablename: students,
        data: [
          `${students}.student_name`,
          `${students}.father_name`,
          `${students}.address`,
          `${classes}.class_name`,
          `${students}.gender`,
          `${students}.roll_no`,
          `${students}.center`,
          `${centers}.center as center_name`,
        ],
        cond: cond,
        orderby: orderClause,
        joins: [
          {
            jointype: "inner",
            tables: [
              { tb: students, on: "center" },
              { tb: centers, on: "row_id" },
            ],
          },
          {
            jointype: "inner",
            tables: [
              { tb: students, on: "class_id" },
              { tb: classes, on: "row_id" },
            ],
          },
        ],
      };

      const studentResp = await query.select_query(parameters);

      if (!studentResp?.length) {
        return libFunc.sendResponse(res, {
          status: 1,
          msg: "No students found for the given ordering filters.",
          data: [],
        });
      }

      const countResp = await query.select_query({
        tablename: students,
        data: ["COUNT(*) AS total_students"],
        cond: cond,
      });

      return libFunc.sendResponse(res, {
        status: 0,
        msg: "Ordered students fetched successfully.",
        total_students: countResp[0]?.total_students || 0,
        data: studentResp,
      });
    }

    // CASE 4: Default Case - Date Filter or Gender
    else {
      const queryStr = `
        SELECT 
          ${schema}.students.student_name,
          ${schema}.students.father_name,
          ${schema}.students.address,
          ${schema}.classes.class_name,
          ${schema}.students.gender,
          ${schema}.students.roll_no,
          ${schema}.students.center,
          ${schema}.centers.center AS center_name
        FROM ${schema}.students
        INNER JOIN ${schema}.centers ON ${schema}.students.center = ${schema}.centers.row_id
        INNER JOIN ${schema}.classes ON ${schema}.students.class_id = ${schema}.classes.row_id
        WHERE 
          ${schema}.students.exam_sessions = '${exam_sessions}' AND 
          ${schema}.students.center = '${center}' AND 
          ${schema}.students.gender = '${gender}' AND
          ${schema}.students.cr_on BETWEEN '${from_date}' AND '${to_date}';
      `;

      const studentResp = await query.custom_query(queryStr);

      if (!studentResp?.length) {
        return libFunc.sendResponse(res, {
          status: 1,
          msg: "No students found for the given date and gender filters.",
          data: [],
        });
      }

      return libFunc.sendResponse(res, {
        status: 0,
        msg: "Students filtered by date and gender fetched successfully.",
        data: studentResp,
      });
    }
  } catch (error) {
    console.error("Error fetching center-wise students:", error);
    return libFunc.sendResponse(res, {
      status: 1,
      msg: "Unexpected error occurred while fetching student records.",
      error: error.message,
    });
  }
}


async function fetchStudentMarksReports(req, res) {
  try {
    const { exam_session, bandal_no, class_id, center, marksfrom, marksto } = req.data;

    // Validate required fields
    if (!exam_session) {
      return libFunc.sendResponse(res, {
        status: 1,
        msg: "Missing required field: exam_session",
      });
    }

    let studentResp;

    // If bandal_no is provided, fetch by bandal_no
    if (bandal_no) {
      const cond = {
        AND: {
          [`${bandals}.exam_session`]: exam_session,
          [`${bandals}.bandal_no`]: bandal_no,
        },
      };

      const parameters = {
        tablename: bandals,
        data: [
          `${students}.roll_no`,
          "bandal_no",
          "class_name",
          "marks",
          `${copyCheckers}.name as copy_checker`,
        ],
        cond: cond,
        joins: [
          {
            jointype: "inner",
            tables: [
              { tb: bandals, on: "student_row_id" },
              { tb: students, on: "row_id" },
            ],
          },
          {
            jointype: "inner",
            tables: [
              { tb: bandals, on: "class" },
              { tb: classes, on: "row_id" },
            ],
          },
          {
            jointype: "inner",
            tables: [
              { tb: bandals, on: "copy_checker_id" },
              { tb: copyCheckers, on: "row_id" },
            ],
          },
          {
            jointype: "inner",
            tables: [
              { tb: bandals, on: "student_row_id" },
              { tb: markstable, on: "student_row_id" },
            ],
          },
        ],
      };

      studentResp = await query.select_query(parameters);
    } 
    // Else fetch by filter range
    else {
      // Validate required filters
      if (!center || !class_id || marksfrom === undefined || marksto === undefined) {
        return libFunc.sendResponse(res, {
          status: 1,
          msg: "Missing required fields for marks range filtering: center, class_id, marksfrom, marksto",
        });
      }

      const fetchFilterMarks = `
        SELECT 
          ${students}.roll_no,
          bandal_no,
          class_name,
          ${copyCheckers}.name as copy_checker,
          marks
        FROM ${bandals}
        INNER JOIN ${students} ON ${bandals}.student_row_id = ${students}.row_id
        INNER JOIN ${classes} ON ${bandals}.class = ${classes}.row_id
        INNER JOIN ${copyCheckers} ON ${bandals}.copy_checker_id = ${copyCheckers}.row_id
        INNER JOIN ${markstable} ON ${bandals}.student_row_id = ${markstable}.student_row_id
        INNER JOIN ${centers} ON ${students}.center = ${centers}.row_id
        WHERE 
          ${bandals}.exam_session = '${exam_session}'
          AND ${students}.center = '${center}'
          AND ${bandals}.class = '${class_id}'
          AND marks BETWEEN ${marksfrom} AND ${marksto};
      `;

      studentResp = await query.custom_query(fetchFilterMarks);
    }

    if (!studentResp || studentResp.length === 0) {
      return libFunc.sendResponse(res, {
        status: 1,
        msg: "No student marks found with the given filters.",
        data: [],
      });
    }

    const resp = {
      status: 0,
      msg: "Student marks report fetched successfully.",
      data: studentResp,
    };

    console.log("Marks Report:", resp);
    libFunc.sendResponse(res, resp);

  } catch (error) {
    console.error("Error fetching student marks report:", error);
    libFunc.sendResponse(res, {
      status: 1,
      msg: "An unexpected error occurred while fetching student marks report.",
      error: error.message,
    });
  }
}


