const connect_db = require("./connect_db/db_connect.js");
const libFunc = require("./functions.js");
const jwt = require("jsonwebtoken");
const query = require("./connect_db/queries.js");

const multer = require("multer");
const path = require("path");
const axios = require("axios");
const { update } = require("bower/lib/commands/index.js");
const { Console, count } = require("console");
const moment = require("moment"); // If using Node.js

// const mysql = require('mysql2/promise');
// const { Client } = require('pg');
// const { v4: uuidv4 } = require('uuid');

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

module.exports = function () {
  this.common_fn = common_fn;
};

/**
 *  Description :  Common Data Base Functions
 */
let common_fn = {
  // Users
  lo_us: loginUser,
  cr_us: createUser,
  ch_pass: changePassword,

  // Students
  cr_stu: createOrUpdateStudent,
  fe_stu: fetchAllStudent,
  st_stu: softDeleteOrStatusChangeStudent,
  fe_fil_student: filterStudents,

  // Checker
  cr_checker: createOrUpdateChecker,
  fe_checker: fetchChecker,
  st_checker: softDeleteOrStatusChangeChecker,

  // Exam Sessions
  cr_session: createOrUpdateExamSession,
  st_sess: softDeleteOrStatusChangeExamSession,
  fe_session: fetchExamSessions,

  // Centers
  cr_center: createCenter,
  fe_center: fetchCenters,

  //class
  cr_class: createClass,
  fe_class: fetchClass,
  fe_class_fac: fetchClassesByFaculty,

  // branch
  cr_branch: createOrUpdateBranch,
  fe_branch: fetchBranch,

  // Map Student to Center
  map_stu_center: mapstudentwithcentercode,

  // Attendance
  fe_attend: fetchattendance,
  up_attend_st: updateAttendanceStatus,

  // Bandal (Copy checking bundles)
  cr_band: createBandal,
  fe_bandalNo: fetchlatestbandalNo,
  fe_bandal_not_stu: fetchStudentsWhichnotassignedBundal,
  fe_stu_ass_bandal: fetchStudentsWhichassignedBunal,

  //marks
  cr_marks: createMarks,
  fe_marks: fetchMarks,

  // data transfer
  dt_db: DataTransferMySQLtoPostgresSQL,

  // fetch count
  fe_count: fetchCountRecord,

  // reports
  fe_stu_rep_center: fetchCenterWiseStudents,

  fe_marks_report: fetchStudentMarksReports,

  fe_rejact_exam_stu: fetchRejactStudentofExam,

  // Merit list
  fe_merit_list: fetchMeritlist,

  // Sample Book
  cr_sam_book: createOrUpdateSampleBook,
  st_sam_book: softDeleteOrStatusChangeSampleBook,
  fe_sam_book: fetchSampleBook,

  // Sample Paper
  cr_sam_paper: createOrUpdateSamplePaper,
  st_sam_paper: softDeleteOrStatusChangeSamplePaper,
  fe_sam_paper: fetchSamplePaper,

  // events
  cr_events: createUpdateEvents,
  fe_events: fetchEvents,

  // reports api
  fe_stu_rep_stat_city: fetchStudentsByStateOrCity,
  fe_stu_tot_center: fetchCenterWiseTotalStudentReport,
  fe_stu_centewise: fetchCenterWiseStudent,
  fe_stu_card: fetchAdmissionCardReport,
  fe_stu_marks: marksreport,
  fe_stu_marks_filter: MarksFilterReport,
};

const schema = "shikshanboard";

const users = schema + ".users";
const students = schema + ".students";
const copyCheckers = schema + ".copy_checkers";
const examSessions = schema + ".exam_sessions";
const centers = schema + ".centers";
const classes = schema + ".classes";
const branch = schema + ".branch";
const attendance = schema + ".attendance";
const bandals = schema + ".bandals";
const markstable = schema + ".marks";
const test29branch = schema + ".test29branch";
const sampleBook = schema + ".samplebook";
const samplepaper = schema + ".samplepaper";
const event = schema + ".event";

/**
 * Login user
 */

async function checklogin(username, password) {
  try {
    const query = `
          SELECT * 
          FROM ${schema}.users 
          WHERE user_name = $1 AND user_password = $2
      `;

    // Use parameterized queries to prevent SQL injection
    const result = await connect_db.query(query, [username, password]);

    if (result.rows.length > 0) {
      return { status: 0, data: result.rows[0] }; // users found
    } else {
      return { status: 1 }; // users not found
    }
  } catch (err) {
    // console.error("Error during organization check:", err);
    return { status: 1 }; // Indicate an error occurred
  }
}

async function loginUser(req, res) {
  // get request
  const username = req.data.user_name.trim();
  const password = req.data.user_password.trim();

  // Validate required fields
  if (!username || !password) {
    const resp = { status: 1, msg: "Missing required fields" };
    // console.log("response of validation ", resp);
    return libFunc.sendResponse(res, resp);
  }
  // console.log("Email:", email, "Password:", password);

  // exception handle
  try {
    const result = await checklogin(username, password);

    if (result.status === 0) {
      // Generate JWT token
      const token = jwt.sign(
        { UserId: result.data.row_id, Username: result.data.username },
        JWT_SECRET,
        { expiresIn: 259200 } // expires in 72 hours/ 3 days
      );
      //  console.log("result",result.data)
      const resp = {
        status: 0,
        msg: "Login Successfully",
        data: { token: token, Username: result.data.user_name },
      };
      // console.log("response", resp)
      libFunc.sendResponse(res, resp);
    } else {
      const resp = {
        status: 1,
        msg: "Invalid email or Password",
      };
      // console.log("response", resp)
      libFunc.sendResponse(res, resp);
    }
  } catch (err) {
    // console.error("Error during login:", err);
    const resp = {
      status: 1,
      // msg: `An error occurred during login ${err.message}`,
      error: err.message, // Optionally include the error message
    };
    // console.log("response", resp)
    libFunc.sendResponse(res, resp);
  }
}

function createUser(req, res) {
  var row_id = libFunc.randomid();
  var { user_name, user_password } = req.data;
  console.log("req", req);

  const column = {
    row_id,
    user_name,
    user_password,
  };
  //   console.log("cloumn data", column)

  var data = query.insert_data(users, column);

  const resp = {
    status: 0,
    msg: "user created successfully",
    //   data: data,
    //   row_id: row_id,
  };

  // console.log("response", resp)
  libFunc.sendResponse(res, resp);
}

/**
 * Create Student
 */

async function createOrUpdateStudent(req, res) {
  try {
    let {
      row_id,
      gender,
      student_name,
      father_name,
      address,
      state,
      city,
      zip_code,
      ahhar_no,
      phone_r,
      phone_o,
      mobile_no,
      dob,
      education,
      medium,
      account_no,
      account_name,
      bank_name,
      branch_name,
      ifsc_code,
      remarks,
    } = req.data;

    // Validate required fields (basic example)
    if (!gender || !student_name || !father_name) {
      const debugResp = {
        status: 1,
        msg: "Missing required fields ",
      };
      // console.log("debugResp->", debugResp);
      return libFunc.sendResponse(res, debugResp);
    }

    const formattedDate = moment(dob).format("YYYY-MM-DD");

    let response;

    if (row_id) {
      // ========== Update Student ==========
      const updateData = {
        gender,
        student_name,
        father_name,
        dob: formattedDate,
        mobile_no,
        address,
        state,
        city,
        zip_code,
        ahhar_no,
        phone_r,
        phone_o,
        medium,
        education,
        account_no,
        account_name,
        bank_name,
        branch_name,
        ifsc_code,
        remarks,
        up_on: new Date().toISOString(),
      };

      await query.update_data(students, updateData, { row_id: row_id });

      response = {
        status: 0,
        msg: "Student updated successfully",
      };
    } else {
      // ========== Create Student ==========
      row_id = libFunc.randomid();

      // Fetch the latest roll_no from the database and increment by 1
      const latestRollNoQuery = `SELECT MAX(roll_no) as roll_no FROM ${schema}.students`;
      const latestRollNoResult = await query.custom_query(latestRollNoQuery);

      let roll_no = 1000; // Default starting roll_no
      if (
        latestRollNoResult &&
        latestRollNoResult[0] &&
        latestRollNoResult[0].roll_no
      ) {
        roll_no = latestRollNoResult[0].roll_no + 1;
      }

      const createData = {
        row_id,
        gender,
        student_name,
        father_name,
        dob: formattedDate,
        mobile_no,
        address,
        state,
        city,
        zip_code,
        ahhar_no,
        phone_r,
        phone_o,
        medium,
        education,
        account_no,
        account_name,
        bank_name,
        branch_name,
        ifsc_code,
        remarks,
        roll_no,
      };

      await query.insert_data(students, createData);

      response = {
        status: 0,
        msg: "Student created successfully",
      };
    }

    // console.log("Student response:", response);
    libFunc.sendResponse(res, response);
  } catch (error) {
    // console.error("Error creating/updating student:", error);
    libFunc.sendResponse(res, {
      status: 1,
      msg: "An error occurred while creating/updating the student",
      error: error.message,
    });
  }
}

/**
 * Fetch all student list
 */

async function fetchAllStudent(req, res) {
  try {
    const { limit = 5, page = 1, showDeleted = false } = req.data || {};
    const offset = (page - 1) * limit;

    const cond = {};
    if (!showDeleted) {
      cond.is_deleted = false;
    }

    const parameters = {
      tablename: students,
      cond: cond,
      orderby: { cr_on: "desc" },
      limit: { LIMIT: limit },
      offset: { OFFSET: offset },
    };

    // console.log("Fetching students...");

    // Fetch paginated students
    const studentsList = await query.select_query(parameters);
    // console.log("Fetched students:", studentsList);

    // Fetch total students count
    const totalStudents = await query.count(students, cond);

    if (!studentsList || studentsList.length === 0) {
      libFunc.sendResponse(res, {
        status: 1,
        msg: "No students found",
        data: [],
        totalStudents: 0,
        currentPage: page,
        pageSize: limit,
        totalPages: 0,
      });
    }

    const totalPages = Math.ceil(totalStudents / limit);

    const resp = {
      status: 0,
      msg: "Students fetched successfully",
      data: studentsList,
      // totalStudents: totalStudents,
      // currentPage: page,
      // pageSize: limit,
      // totalPages: totalPages,
    };

    // console.log("Fetched students:", resp);

    libFunc.sendResponse(res, resp);
  } catch (error) {
    // console.error("Error fetching students:", error);
    libFunc.sendResponse(res, {
      status: 1,
      msg: "An error occurred while fetching students",
      error: error.message,
    });
  }
}

/**
 *  create checker
 */

async function createOrUpdateChecker(req, res) {
  try {
    const { row_id, name, address, mobile } = req.data;

    // Validate required fields
    // if (!name || !address || !mobile) {
    //   const validation = {
    //     status: 1,
    //     msg: "Missing required fields (name, address, and mobile are required)",
    //   };

    //   console.log("res", validation);
    //   return libFunc.sendResponse(res, validation);
    // }

    let response;

    if (row_id) {
      // ============ Update existing checker ============
      const updateData = {
        name,
        address,
        mobile,
        up_on: new Date().toISOString(),
      };

      await query.update_data(copyCheckers, updateData, { row_id: row_id });

      response = {
        status: 0,
        msg: "Checker updated successfully",
      };
    } else {
      // ============ Create new checker ============
      const new_row_id = libFunc.randomid();

      const createData = {
        row_id: new_row_id,
        name,
        address,
        mobile,
      };

      await query.insert_data(copyCheckers, createData);

      response = {
        status: 0,
        msg: "Checker created successfully",
      };
    }

    // console.log("res", response);
    libFunc.sendResponse(res, response);
  } catch (error) {
    // console.error("Error creating/updating checker:", error);
    libFunc.sendResponse(res, {
      status: 1,
      msg: "An error occurred while creating/updating the checker",
      error: error.message,
    });
  }
}

/**
 *  Fetch checker
 */

async function fetchChecker(req, res) {
  try {
    // Destructure and sanitize pagination parameters
    let { limit = 5, page = 1, showDeleted = false } = req.data;

    const offset = (page - 1) * limit;

    const cond = {};
    if (!showDeleted) {
      cond.is_deleted = false; // Only non-deleted branches if not requested explicitly
    }

    // Query to fetch bandals with pagination
    const parameters = {
      tablename: copyCheckers,
      cond: cond,
      orderby: { cr_on: "desc" },
      limit: { LIMIT: limit },
      offset: { OFFSET: offset },
    };

    const fetchChecker = await query.select_query(parameters);

    if (!fetchChecker || fetchChecker.length === 0) {
      const handle = {
        status: 1,
        msg: "No Checker found with the given filters.",
        data: [],
      };
      // console.log("resp", handle);
      return libFunc.sendResponse(res, handle);
    }

    const resp = {
      status: 0,
      msg: "Checker fetched successfully",
      data: fetchChecker,
    };

    // console.log("resp", resp);
    // Send response with bandals data and pagination info
    libFunc.sendResponse(res, resp);
  } catch (error) {
    // console.error("Error fetching Checker:", error);
    libFunc.sendResponse(res, {
      status: 1,
      msg: "An error occurred while fetching Checker",
      error: error.message,
    });
  }
}

/**
 *  Exam sessions
 */

async function createOrUpdateExamSession(req, res) {
  try {
    const { row_id, name, exam_date } = req.data;

    // if (!name || !exam_date) {
    //   console.log("Missing Fields Response");
    //   return libFunc.sendResponse(res, {
    //     status: 1,
    //     msg: "Missing required fields (name and exam_date are required)",
    //   });
    // }

    // Format exam_date to YYYY-MM-DD
    //  const formattedExamDate = new Date(exam_date).toISOString().split("T")[0];

    const formattedExamDate = moment(exam_date).format("YYYY-MM-DD");

    //  console.log("formattedExamDate",formattedExamDate)

    let response;

    if (row_id) {
      // ============ Update existing exam session ============
      const updateData = {
        session_name: name,
        exam_date: formattedExamDate,
        up_on: new Date().toISOString(),
      };

      await query.update_data(examSessions, updateData, { row_id: row_id });

      response = {
        status: 0,
        msg: "Exam session updated successfully",
      };
    } else {
      // ============ Create new exam session ============
      const new_row_id = libFunc.randomid();

      const createData = {
        row_id: new_row_id,
        session_name: name,
        exam_date: formattedExamDate,
      };

      await query.insert_data(examSessions, createData);

      response = {
        status: 0,
        msg: "Exam session created successfully",
      };
    }

    // console.log("resp", response);
    libFunc.sendResponse(res, response);
  } catch (error) {
    // console.error("Error creating/updating exam session:", error);
    libFunc.sendResponse(res, {
      status: 1,
      msg: "An error occurred while creating/updating the exam session",
      error: error.message,
    });
  }
}

/**
 *  Fetch Exam sessions
 */

async function fetchExamSessions(req, res) {
  try {
    // Destructure and sanitize pagination parameters
    let { limit = 5, page = 1, showDeleted = false } = req.data;

    const offset = (page - 1) * limit;

    const cond = {};
    if (!showDeleted) {
      cond.is_deleted = false; // Only non-deleted branches if not requested explicitly
    }

    // Query to fetch exam sessions with pagination
    const parameters = {
      tablename: examSessions,
      orderby: { cr_on: "desc" },
      limit: { LIMIT: limit },
      offset: { OFFSET: offset },
    };

    const response = await query.select_query(parameters);

    if (!response || response.length === 0) {
      const handle = {
        status: 1,
        msg: "No ExamSessions found with the given filters.",
        data: [],
      };
      // console.log("resp", handle);
      return libFunc.sendResponse(res, handle);
    }

    const resp = {
      status: 0,
      msg: "Exam sessions fetched successfully",
      data: response,
    };

    // console.log("resp", resp);
    // Send response with exam session data
    libFunc.sendResponse(res, resp);
  } catch (error) {
    // console.error("Error fetching exam sessions:", error);
    libFunc.sendResponse(res, {
      status: 1,
      msg: "An error occurred while fetching the exam sessions",
      error: error.message,
    });
  }
}

/**
 *  Create Center
 */

async function createCenter(req, res) {
  try {
    const {
      branch_id,
      center,
      center_head_name,
      email,
      address,
      date_of_birth,
      state,
      city,
      std_code,
      phone_no,
      mobile_no,
      account_no,
      account_name,
      bank_name,
      branch_name,
      ifsc_code,
    } = req.data;

    const timestamp = Date.now(); // current time in milliseconds
    const center_code = Math.floor(Math.random() * 10000); // random 4-digit number

    // Generate row_id
    const row_id = libFunc.randomid();

    // Create the record for the new center
    const column = {
      row_id,
      branch_id,
      center,
      center_head_name,
      email,
      address,
      date_of_birth,
      state,
      city,
      std_code,
      phone_no,
      mobile_no,
      account_no,
      account_name,
      bank_name,
      branch_name,
      ifsc_code,
      center_code,
    };

    // Insert center data into the database
    const data = await query.insert_data(centers, column);

    // Response to client
    const response = {
      status: 0,
      msg: "Center created successfully",
      data: data,
    };
    // console.log("resp",response)
    libFunc.sendResponse(res, response);
  } catch (error) {
    // console.error("Error creating center:", error);
    libFunc.sendResponse(res, {
      status: 1,
      msg: "An error occurred while creating the center",
    });
  }
}

/**
 *  fetch Center
 */

async function fetchCenters(req, res) {
  try {
    // Destructure and sanitize pagination parameters
    let { limit = 5, page = 1 } = req.data;

    const offset = (page - 1) * limit;

    // Query to fetch centers with pagination
    const parameters = {
      tablename: centers,
      columns: null,
      limit: { LIMIT: limit },
      offset: { OFFSET: offset },
    };

    const centersResp = await query.select_query(parameters);

    const resp = {
      status: 0,
      msg: "Centers fetched successfully",
      data: centersResp,
    };

    // console.log("resp",resp)
    // Send response with center data
    libFunc.sendResponse(res, resp);
  } catch (error) {
    // console.error("Error fetching centers:", error);
    libFunc.sendResponse(res, {
      status: 1,
      msg: "An error occurred while fetching the centers",
      error: error.message,
    });
  }
}

/**
 *  Create Classs
 */

async function createClass(req, res) {
  try {
    const {
      row_id,
      faculty,
      name,
      first_price,
      second_price,
      third_price,
      merit_list_upto_10_price,
      marks_greater_equal_to_90,
      marks_70_to_less_then_90,
      marks_50_to_less_then_70,
    } = req.data;

    if (row_id) {
      const updateData = {
        row_id,
        faculty,
        class_name: name,
        first_price,
        second_price,
        third_price,
        merit_list_upto_10_price,
        marks_greater_equal_to_90,
        marks_70_to_less_then_90,
        marks_50_to_less_then_70,
      };

      await query.update_data(classes, updateData, { row_id: row_id });

      const response = {
        status: 0,
        msg: "class updated successfully",
      };
      // console.log("resp", response);
      libFunc.sendResponse(res, response);
    } else {
      // Generate row_id
      const row_id = libFunc.randomid();

      // Create the record for the new class
      const column = {
        row_id,
        faculty,
        class_name: name,
        first_price,
        second_price,
        third_price,
        merit_list_upto_10_price,
        marks_greater_equal_to_90,
        marks_70_to_less_then_90,
        marks_50_to_less_then_70,
      };

      // Insert center data into the database
      const data = await query.insert_data(classes, column);

      // console.log("data----->",data.row_id)

      // Response to client
      const response = {
        status: 0,
        msg: "class created successfully",
        data: data,
      };
      // console.log("resp",response)
      libFunc.sendResponse(res, response);
    }
  } catch (error) {
    // console.error("Error creating class:", error);
    libFunc.sendResponse(res, {
      status: 1,
      msg: "An error occurred while creating the class",
    });
  }
}

/**
 *  Fetch Classs
 */

async function fetchClass(req, res) {
  try {
    // Destructure and sanitize pagination parameters
    let { limit = 5, page = 1 } = req.data;

    const offset = (page - 1) * limit;

    // Query to fetch centers with pagination
    const parameters = {
      tablename: classes,
      columns: null,
      limit: { LIMIT: limit },
      offset: { OFFSET: offset },
    };

    const classResp = await query.select_query(parameters);

    const resp = {
      status: 0,
      msg: "classes fetched successfully",
      data: classResp,
    };

    // console.log("resp",resp)
    // Send response with center data
    libFunc.sendResponse(res, resp);
  } catch (error) {
    console.error("Error fetching class:", error);
    libFunc.sendResponse(res, {
      status: 1,
      msg: "An error occurred while fetching the class",
      error: error.message,
    });
  }
}

/**
 *  Fetch branch
 */

async function fetchBranch(req, res) {
  try {
    // Destructure and sanitize pagination parameters
    let { limit = 5, page = 1, showDeleted = false } = req.data;

    const offset = (page - 1) * limit;

    // Build conditions
    const cond = {};
    if (!showDeleted) {
      cond.is_deleted = false; // Only non-deleted branches if not requested explicitly
    }

    // Query to fetch branches with pagination
    const parameters = {
      tablename: branch,
      cond: cond,
      limit: { LIMIT: limit },
      offset: { OFFSET: offset },
      orderby: { city: "desc" }, // Latest first
    };

    const branchResp = await query.select_query(parameters);

    if (!branchResp || branchResp.length === 0) {
      const handle = {
        status: 1,
        msg: "No branch found with the given filters.",
        data: [],
      };
      // console.log("resp", handle);
      return libFunc.sendResponse(res, handle);
    }

    const resp = {
      status: 0,
      msg: "Branch fetched successfully",
      data: branchResp,
      pagination: {
        page: page,
        limit: limit,
      },
    };

    // console.log("fetchBranch resp:", resp);
    // Send response with branch data
    libFunc.sendResponse(res, resp);
  } catch (error) {
    // console.error("Error fetching branch:", error);
    libFunc.sendResponse(res, {
      status: 1,
      msg: "An error occurred while fetching the branch",
      error: error.message,
    });
  }
}

/**
 *  Create branch
 */

async function createOrUpdateBranch(req, res) {
  try {
    const { row_id, branch_name, branch_head_name, address, city, mobile_no } =
      req.data;

    if (row_id) {
      // If row_id exists → UPDATE branch
      const updateData = {
        branch_name,
        branch_head_name,
        address,
        city,
        mobile_no,
        up_on: new Date().toISOString(), // Update the time
      };

      await query.update_data(branch, updateData, { row_id: row_id });

      const response = {
        status: 0,
        msg: "Branch updated successfully",
      };
      // console.log("resp", response);
      libFunc.sendResponse(res, response);
    } else {
      // If row_id not provided → CREATE new branch
      const newRowId = libFunc.randomid();

      const insertData = {
        row_id: newRowId,
        branch_name,
        branch_head_name,
        address,
        city,
        mobile_no,
      };

      const data = await query.insert_data(branch, insertData);

      const response = {
        status: 0,
        msg: "Branch created successfully",
        data: data,
      };
      // console.log("resp", response);
      libFunc.sendResponse(res, response);
    }
  } catch (error) {
    // console.error("Error creating/updating branch:", error);
    libFunc.sendResponse(res, {
      status: 1,
      msg: "An error occurred while creating/updating the branch",
      error: error.message,
    });
  }
}

/**
 *  map center code with students details
 */

// async function mapstudentwithcentercode(req, res) {
//   const column = {
//     exam_sessions: req.data.exam_sessions,
//     class_id : req.data.class_id,
//     center:req.data.center
//   }
//   const cond = {
//     row_id: req.data.row_id
//   }

//   var data = await query.update_data(students, column, cond)

//   const resp = {
//     status: 0,
//     msg: "Center code assigned with student ",
//     data: data
//   };

//   // console.log("response", resp)
//   libFunc.sendResponse(res, resp);
// }

async function mapstudentwithcentercode(req, res) {
  try {
    await connect_db.query("BEGIN TRANSACTION");
    const column = ({ faculty, exam_sessions, class_id, center } = req.data);
    const cond = {
      row_id: req.data.row_id,
    };

    if (!exam_sessions || !class_id || !center) {
      const debugResp = {
        status: 1,
        msg: "Missing required fields ",
      };
      console.log("debugResp->", debugResp);
      return libFunc.sendResponse(res, debugResp);
    }

    var studenttableResp = await query.update_data(students, column, cond);

    // console.log("studenttableResp",studenttableResp,studenttableResp > 0)

    if (studenttableResp > 0) {
      const row_id = libFunc.randomid();

      const attendancecolumn = {
        row_id,
        faculty: req.data.faculty,
        student_row_id: req.data.row_id,
        exam_session: req.data.exam_sessions,
        class: req.data.class_id,
        center_code: req.data.center,
        status: 0,
      };

      // console.log("attendancecolumn",attendancecolumn)

      const attendanceTableResp = await query.insert_data(
        attendance,
        attendancecolumn
      );

      // console.log("attendanceTableResp",attendanceTableResp,attendanceTableResp.row_id !=null)

      if (attendanceTableResp.row_id != null) {
        await connect_db.query("COMMIT");

        const resp = {
          status: 0,
          msg: "Center code assigned with student successful ",
        };

        // console.log("resp",resp)
        libFunc.sendResponse(res, resp);
      } else {
        await connect_db.query("ROLLBACK");

        const resp = {
          status: 1,
          msg: "Something went wrong",
        };
        // console.log("resp",resp)

        libFunc.sendResponse(res, resp);
      }
    } else {
      await connect_db.query("ROLLBACK");

      const resp = {
        status: 1,
        msg: "Something went wrong",
      };
      // console.log("resp",resp)

      libFunc.sendResponse(res, resp);
    }
  } catch (error) {
    await connect_db.query("ROLLBACK");
    // console.log(error);
    const resp = {
      status: 2,
      msg: "Something went wrong",
    };

    libFunc.sendResponse(res, resp);
  }
}

/**
 *  fetch attendance
 */

async function fetchattendance(req, res) {
  try {
    // Destructure and sanitize pagination parameters
    let { exam_sessions, class_id, center, limit = 5, page = 1 } = req.data;

    const offset = (page - 1) * limit;

    let parameters = {
      tablename: attendance,
      data: [
        "student_name",
        "father_name",
        "status",
        "center_code",
        "class_name",
        "session_name",
        "roll_no",
        `${schema + "."}` + "attendance.row_id as attendance_row_id",
        `${attendance}` + ".remarks",
      ],
      //   cond: {
      //     AND: {
      //       [attendance + ".attendance.center_code"]: center,
      //       [schema + ".attendance.class"]: class_id,
      //       [schema  + ".attendance.exam_session"]: exam_sessions
      //     },

      // },
      cond: {
        AND: {
          [schema + ".attendance.center_code"]: center,
          [schema + ".attendance.class"]: class_id,
          [schema + ".attendance.exam_session"]: exam_sessions,
        },
      },
      orderby: null,
      limit: { LIMIT: limit },
      offset: { OFFSET: offset },
      joins: [
        {
          jointype: "inner",
          tables: [
            { tb: attendance, on: "student_row_id" },
            { tb: students, on: "row_id" },
          ],
        },
        {
          jointype: "inner",
          tables: [
            { tb: students, on: "exam_sessions" },
            { tb: examSessions, on: "row_id" },
          ],
        },
        {
          jointype: "right",
          tables: [
            { tb: students, on: "class_id" },
            { tb: classes, on: "row_id" },
          ],
        },
      ],
    };

    const attendanceResp = await query.select_query(parameters);

    const resp = {
      status: 0,
      msg: "attendance fetched successfully",
      data: attendanceResp,
    };

    console.log("resp", resp);
    // Send response with center data
    libFunc.sendResponse(res, resp);
  } catch (error) {
    // console.error("Error fetching attendance:", error);
    libFunc.sendResponse(res, {
      status: 1,
      msg: "An error occurred while fetching the attendance",
      error: error.message,
    });
  }
}

/**
 *  update attendance status
 */

// async function updateAttendanceStatus(req, res) {
//   try {
//     const column = {
//       status: req.data.status,
//     };
//     const cond = {
//       row_id: req.data.row_id,
//     };

//     var attendanceStautsResp = await query.update_data(
//       attendance,
//       column,
//       cond
//     );
//     // console.log("resp",attendanceStautsResp > 0)

//     if (attendanceStautsResp > 0) {
//       const resp = {
//         status: 0,
//         msg: "AttendanceStatus updated successful ",
//       };

//       // console.log("resp",resp)
//       libFunc.sendResponse(res, resp);
//     } else {
//       const resp = {
//         status: 1,
//         msg: "Something went wrong",
//       };

//       // console.log("resp",resp)
//       libFunc.sendResponse(res, resp);
//     }
//   } catch (error) {
//     // console.log(error);
//     const resp = {
//       status: 1,
//       msg: "Something went wrong",
//     };

//     libFunc.sendResponse(res, resp);
//   }
// }

async function updateAttendanceStatus(req, res) {
  try {
    const { status, row_id, remarks } = req.data;

    // Validate required fields
    const missingFields = [];
    if (status === undefined) missingFields.push("status");
    if (!row_id) missingFields.push("row_id");

    if (missingFields.length > 0) {
      const resp = {
        status: 1,
        msg: `Missing required field(s): ${missingFields.join(", ")}`,
      };
      console.log("res", resp);
      return libFunc.sendResponse(res, resp);
    }

    // Validate status values
    const validStatuses = [0, 1, 2];
    if (!validStatuses.includes(Number(status))) {
      const handle = {
        status: 1,
        msg: "Invalid status value. Allowed values: 0 (Present), 1 (Absent), 2 (Reject).",
      };
      console.log("res", handle);
      return libFunc.sendResponse(res);
    }

    // If status is 2 (Reject), remarks is required
    if (Number(status) === 2 && (!remarks || remarks.trim() === "")) {
      const handle = {
        status: 1,
        msg: "Remarks are required when rejecting the exam (status = 2).",
      };
      console.log("res", handle);
      return libFunc.sendResponse(res);
    }

    // Prepare columns to update
    const column = { status };
    if (Number(status) === 2) {
      column.remarks = remarks;
    }

    const cond = { row_id };

    const attendanceStatusResp = await query.update_data(
      attendance,
      column,
      cond
    );

    if (attendanceStatusResp > 0) {
      const handle = {
        status: 0,
        msg: `Attendance status updated successfully to ${
          status === 0 ? "Present" : status === 1 ? "Absent" : "Rejected"
        }.`,
      };
      console.log("res", handle);
      return libFunc.sendResponse(res, handle);
    } else {
      return libFunc.sendResponse(res, {
        status: 1,
        msg: "No record updated. Please check if row_id is correct.",
      });
    }
  } catch (error) {
    console.error("Error updating attendance status:", error);
    return libFunc.sendResponse(res, {
      status: 1,
      msg: "An unexpected error occurred while updating attendance status.",
      error: error.message,
    });
  }
}

/**
 * filter students
 */

async function filterStudents(req, res) {
  try {
    let {
      student_name,
      father_name,
      ahhar_no,
      center,
      limit = 5,
      page = 1,
      showDeleted = false,
    } = req.data;

    const offset = (page - 1) * limit;
    // Dynamically build OR condition only with provided filters
    const orConditions = {};
    if (student_name)
      orConditions[`${schema}.students.student_name%`] = student_name;
    if (father_name)
      orConditions[`${schema}.students.father_name%`] = father_name;
    if (ahhar_no) orConditions[`${schema}.students.ahhar_no%`] = ahhar_no;
    if (center) orConditions[`${schema}.students.center%`] = center;
    // if (!showDeleted) {
    //   orConditions["is_deleted"] = false;
    // }

    const parameters = {
      tablename: students,
      cond: Object.keys(orConditions).length ? { OR: orConditions } : null,
      limit: { LIMIT: limit },
      offset: { OFFSET: offset },
    };
    const studentResp = await query.select_query(parameters);

    if (!studentResp || studentResp.length === 0) {
      const handle = {
        status: 1,
        msg: "No students found with the given filters.",
        data: [],
      };
      // console.log("resp", handle);
      return libFunc.sendResponse(res, handle);
    }

    const resp = {
      status: 0,
      msg: "Students fetched successfully",
      data: studentResp,
    };
    // console.log("resp", resp);
    libFunc.sendResponse(res, resp);
  } catch (error) {
    // console.error("Error fetching students:", error);
    libFunc.sendResponse(res, {
      status: 1,
      msg: "An error occurred while fetching the students",
      error: error.message,
    });
  }
}

/**
 * bandals issue
 */

async function createBandal(req, res) {
  try {
    const {
      faculty,
      exam_session,
      class_id,
      copy_checker_id,
      student_ids = [],
    } = req.data;

    // Validate required fields
    if (!exam_session || !class_id || !copy_checker_id) {
      const handle = {
        status: 1,
        msg: "Missing or invalid required fields: faculty, exam_session, class_id, copy_checker_id, and student_ids",
      };
      console.log("res", handle);
      return libFunc.sendResponse(res, handle);
    }

    // Fetch the latest bandal_no and increment it
    const latestbandal_noQuery = `SELECT MAX(bandal_no) as bandal_no FROM ${schema}.bandals`;
    const latestbandal_noResult = await query.custom_query(
      latestbandal_noQuery
    );

    let bandal_no = 500; // Default starting value
    if (latestbandal_noResult?.[0]?.bandal_no) {
      bandal_no = latestbandal_noResult[0].bandal_no + 1;
    }

    // Insert mapping into bandals table
    for (let student_row_id of student_ids) {
      try {
        const mapping = {
          row_id: libFunc.randomid(),
          bandal_no,
          exam_session,
          class: class_id,
          copy_checker_id,
          student_row_id,
          faculty,
        };

        await query.insert_data(bandals, mapping);
      } catch (insertErr) {
        console.error(
          `Error inserting student_row_id ${student_row_id}:`,
          insertErr
        );
        return libFunc.sendResponse(res, {
          status: 1,
          msg: `Failed to map student ${student_row_id} to bandal.`,
          error: insertErr.message,
        });
      }
    }

    // Success response
    const response = {
      status: 0,
      msg: "Bandal created and students mapped successfully",
      data: {
        bandal_id: bandal_no,
        student_count: student_ids.length,
      },
    };

    return libFunc.sendResponse(res, response);
  } catch (error) {
    console.error("Error in createBandal:", error);
    return libFunc.sendResponse(res, {
      status: 1,
      msg: "Failed to create bandal",
      error: error.message,
    });
  }
}

/**
 * fetch letast bandal no
 */

async function fetchlatestbandalNo(req, res) {
  try {
    const latestbandal_noQuery = `SELECT MAX(bandal_no) as bandal_no FROM ${schema}.bandals`;
    const latestbandal_noResult = await query.custom_query(
      latestbandal_noQuery
    );

    if (!latestbandal_noResult || latestbandal_noResult.length === 0) {
      const handle = {
        status: 1,
        msg: "No bandals no found with the given filters.",
        data: [],
      };
      // console.log("resp", handle);
      return libFunc.sendResponse(res, handle);
    }

    if (
      latestbandal_noResult &&
      latestbandal_noResult[0] &&
      latestbandal_noResult[0].bandal_no
    ) {
      bandal_no = latestbandal_noResult[0].bandal_no + 1; // Increment the latest bandal_no
    }

    const resp = {
      status: 0,
      msg: "bandals fetched successfully",
      data: bandal_no,
    };
    // console.log("resp", resp);
    libFunc.sendResponse(res, resp);
  } catch (error) {}
}

/**
 * fetchstudentsWhichNotassignedbunal
 */

async function fetchStudentsWhichnotassignedBundal(req, res) {
  try {
    // Destructure and sanitize pagination parameters
    let { exam_sessions, class_id } = req.data;

    // const offset = (page - 1) * limit;

    //  fetchstudentsWhichNotassignedbunal
    let fetchstudents = `
   SELECT
  s.student_name,
  s.father_name,
  s.roll_no,
  s.row_id
FROM
  ${schema}.students s
LEFT JOIN
  ${schema}.bandals b ON s.row_id = b.student_row_id
WHERE
  b.student_row_id IS NULL AND s.exam_sessions ='${exam_sessions}' And  s.class_id = '${class_id}';
   
   `;

    const studentsResp = await query.custom_query(fetchstudents);

    const resp = {
      status: 0,
      msg: "students fetched successfully",
      data: studentsResp,
    };

    console.log("resp", resp);
    // Send response with center data
    libFunc.sendResponse(res, resp);
  } catch (error) {
    // console.error("Error fetching students:", error);
    libFunc.sendResponse(res, {
      status: 1,
      msg: "An error occurred while fetching the students",
      error: error.message,
    });
  }
}

/**
 * marks copy
 */

async function fetchStudentsWhichassignedBunal(req, res) {
  try {
    // Destructure and sanitize pagination parameters
    let { exam_sessions, class_id, copy_checker_id } = req.data;

    // const offset = (page - 1) * limit;

    console.log("req", req.data);

    let parameters = {
      tablename: bandals,
      data: [
        "student_name",
        "father_name",
        "bandal_no",
        `${schema}` + ".bandals.copy_checker_id",
        "center_head_name",
        `${schema}` + ".students.row_id",
        "marks",
        "roll_no",
      ],
      cond: {
        AND: {
          [schema + ".students.exam_sessions"]: exam_sessions,
          class: class_id,
          [schema + ".bandals.copy_checker_id"]: copy_checker_id,
        },
      },
      orderby: null,
      limit: null,
      joins: [
        {
          jointype: "left",
          tables: [
            { tb: bandals, on: "student_row_id" },
            { tb: students, on: "row_id" },
          ],
        },

        {
          jointype: "left",
          tables: [
            { tb: students, on: "center" },
            { tb: centers, on: "row_id" },
          ],
        },
        {
          jointype: "left",
          tables: [
            { tb: students, on: "row_id" },
            { tb: markstable, on: "student_row_id" },
          ],
        },
      ],
    };

    const studentsResp = await query.select_query(parameters);

    const resp = {
      status: 0,
      msg: "students fetched successfully",
      data: studentsResp,
    };

    console.log("resp", resp);
    // Send response with center data
    libFunc.sendResponse(res, resp);
  } catch (error) {
    // console.error("Error fetching students:", error);
    libFunc.sendResponse(res, {
      status: 1,
      msg: "An error occurred while fetching the students",
      error: error.message,
    });
  }
}

/**
 * marks save
 */

async function createMarks(req, res) {
  try {
    const {
      faculty,
      exam_session,
      bandal_no,
      class_id,
      copy_checker_id,
      students = [],
    } = req.data;
    if (!exam_session || students.length === 0) {
      return libFunc.sendResponse(res, {
        status: 1,
        msg: "Missing required fields",
      });
    }
    const results = [];
    for (const student of students) {
      const { student_row_id, marks } = student;
      // Check if student mark already exists
      const existing = `SELECT row_id FROM ${markstable} WHERE student_row_id = '${student_row_id}' AND exam_session = '${exam_session}'`;

      const existingResp = await query.custom_query(existing);

      if (existingResp.length > 0) {
        // Update existing
        const updateResult = `UPDATE ${markstable} SET marks = ${marks}, faculty = ${faculty}, copy_checker_id = '${copy_checker_id}' WHERE row_id = '${existingResp[0].row_id}'`;

        const updateResultResp = await query.custom_query(updateResult);

        results.push({
          student_row_id,
          status: 0,
          msg: "Updated",
        });
      } else {
        // Insert new
        const row_id = libFunc.randomid();
        const insertData = {
          row_id,
          faculty,
          student_row_id,
          exam_session,
          class_id,
          copy_checker_id,
          marks,
        };
        const insertResult = await query.insert_data(markstable, insertData);
        results.push({
          student_row_id,
          status: insertResult ? 0 : 1,
          msg: insertResult ? "Inserted" : "Insert failed",
        });
      }
    }
    const handle = {
      status: 0,
      msg: "Marks processing completed",
      results,
    };
    console.log("res", handle);
    return libFunc.sendResponse(res, handle);
  } catch (error) {
    // console.error("Error processing marks:", error);
    libFunc.sendResponse(res, {
      status: 1,
      msg: "An error occurred while processing marks",
      error: error.message,
    });
  }
}

/**
 * Update password
 */

async function changePassword(req, res) {
  try {
    const { old_password, new_password } = req.data;
    const user_row_id = req.UserId;

    // console.log("user_row_id--", user_row_id);

    if (!old_password || !new_password) {
      const debugResp = {
        status: 1,
        msg: "Missing required fields:  old_password, new_password",
      };
      // console.log("debugResp->", debugResp);

      // return libFunc.sendResponse(res, debugResp);
    }

    // 1. Find the user
    const user = await query.select_query({
      tablename: users,
      // data: ["row_id", "user_password"],
      cond: { row_id: user_row_id },
    });

    // console.log("user--", user);

    if (!user.length) {
      const resp = {
        status: 1,
        msg: "User not found",
      };

      // console.log("resp", resp);
      return libFunc.sendResponse(res, resp);
    }

    const existingUser = user[0];

    // 2. Check old password
    if (existingUser.user_password !== old_password) {
      const resp = {
        status: 1,
        msg: "Old password is incorrect",
      };

      // console.log("resp", resp);

      return libFunc.sendResponse(res, resp);
    }

    // 3. Update new password
    await query.update_data(
      users,
      { user_password: new_password, up_on: new Date().toISOString() },
      { row_id: existingUser.row_id }
    );

    const resp = {
      status: 0,
      msg: "Password changed successfully",
    };

    // console.log("Change Password Response:", resp);
    libFunc.sendResponse(res, resp);
  } catch (error) {
    // console.error("Error changing password:", error);
    libFunc.sendResponse(res, {
      status: 1,
      msg: "An error occurred while changing password",
      error: error.message,
    });
  }
}

/**
 * Students Soft delete or deactivated
 */

async function softDeleteOrStatusChangeStudent(req, res) {
  try {
    const { row_id, is_deleted, is_active } = req.data;

    if (!row_id) {
      const resp = {
        status: 1,
        msg: "row_id is required",
      };

      // console.log("resp", resp);
      return libFunc.sendResponse(res, resp);
    }

    const updateData = {
      up_on: new Date().toISOString(),
    };

    let messages = [];

    if (typeof is_deleted !== "undefined") {
      updateData.is_deleted = is_deleted;
      if (is_deleted) {
        messages.push("student soft-deleted successfully");
      } else {
        messages.push("student restored successfully");
      }
    }

    if (typeof is_active !== "undefined") {
      updateData.is_active = is_active;
      if (is_active) {
        messages.push("student activated successfully");
      } else {
        messages.push("student deactivated successfully");
      }
    }

    if (Object.keys(updateData).length === 1) {
      const resp = {
        status: 1,
        msg: "Nothing to update. Provide is_deleted or is_active.",
      };

      // console.log("resp", resp);
      // Only up_on exists
      return libFunc.sendResponse(res, resp);
    }

    // Update branch
    await query.update_data(students, updateData, { row_id: row_id });

    const response = {
      status: 0,
      msg: messages.join(" & "), // Join messages if both updated
    };

    // console.log("Response:", response);
    libFunc.sendResponse(res, response);
  } catch (error) {
    // console.error("Error updating student:", error);
    libFunc.sendResponse(res, {
      status: 1,
      msg: "An error occurred while student",
      error: error.message,
    });
  }
}

/**
 * Checker Soft delete or deactivated
 */

async function softDeleteOrStatusChangeChecker(req, res) {
  try {
    const { row_id, is_deleted, is_active } = req.data;

    if (!row_id) {
      const resp = {
        status: 1,
        msg: "row_id is required",
      };

      // console.log("resp", resp);
      return libFunc.sendResponse(res, resp);
    }

    const updateData = {
      up_on: new Date().toISOString(),
    };

    let messages = [];

    if (typeof is_deleted !== "undefined") {
      updateData.is_deleted = is_deleted;
      if (is_deleted) {
        messages.push("Checker soft-deleted successfully");
      } else {
        messages.push("Checker restored successfully");
      }
    }

    if (typeof is_active !== "undefined") {
      updateData.is_active = is_active;
      if (is_active) {
        messages.push("Checker activated successfully");
      } else {
        messages.push("Checker deactivated successfully");
      }
    }

    if (Object.keys(updateData).length === 1) {
      const resp = {
        status: 1,
        msg: "Nothing to update. Provide is_deleted or is_active.",
      };

      // console.log("resp", resp);
      // Only up_on exists
      return libFunc.sendResponse(res, resp);
    }

    // Update branch
    await query.update_data(copyCheckers, updateData, { row_id: row_id });

    const response = {
      status: 0,
      msg: messages.join(" & "), // Join messages if both updated
    };

    // console.log("Response:", response);
    libFunc.sendResponse(res, response);
  } catch (error) {
    // console.error("Error updating Checker:", error);
    libFunc.sendResponse(res, {
      status: 1,
      msg: "An error occurred while updating Checker",
      error: error.message,
    });
  }
}

async function softDeleteOrStatusChangeExamSession(req, res) {
  try {
    const { row_id, is_deleted, is_active } = req.data;

    if (!row_id) {
      const resp = {
        status: 1,
        msg: "row_id is required",
      };

      // console.log("resp", resp);
      return libFunc.sendResponse(res, resp);
    }

    const updateData = {
      up_on: new Date().toISOString(),
    };

    let messages = [];

    if (typeof is_deleted !== "undefined") {
      updateData.is_deleted = is_deleted;
      if (is_deleted) {
        messages.push("ExamSession soft-deleted successfully");
      } else {
        messages.push("ExamSession restored successfully");
      }
    }

    if (typeof is_active !== "undefined") {
      updateData.is_active = is_active;
      if (is_active) {
        messages.push("ExamSession activated successfully");
      } else {
        messages.push("ExamSession deactivated successfully");
      }
    }

    if (Object.keys(updateData).length === 1) {
      const resp = {
        status: 1,
        msg: "Nothing to update. Provide is_deleted or is_active.",
      };

      // console.log("resp", resp);
      // Only up_on exists
      return libFunc.sendResponse(res, resp);
    }

    // Update branch
    await query.update_data(examSessions, updateData, { row_id: row_id });

    const response = {
      status: 0,
      msg: messages.join(" & "), // Join messages if both updated
    };

    // console.log("Response:", response);
    libFunc.sendResponse(res, response);
  } catch (error) {
    // console.error("Error updating ExamSession:", error);
    libFunc.sendResponse(res, {
      status: 1,
      msg: "An error occurred while updating ExamSession",
      error: error.message,
    });
  }
}

async function DataTransferMySQLtoPostgresSQL(req, res) {
  // MySQL Connection Config
  const mysqlConfig = {
    host: "localhost",
    user: "root",
    password: "root",
    database: "shtecaoh_jain_board",
  };
  // PostgreSQL Connection Config
  const pgConfig = {
    host: "localhost",
    user: "postgres",
    password: "Admin",
    database: "shikshanboard",
    port: 5432,
  };
  // Function to handle safe timestamps
  function safeDate(date) {
    if (
      !date ||
      date === "0000-00-00 00:00:00" ||
      isNaN(new Date(date).getTime())
    ) {
      return new Date().toISOString(); // return current date if invalid
    }
    return new Date(date).toISOString();
  }
  // Function to convert 'Y'/'N' to true/false
  function toBool(val) {
    return val === "Y";
  }
  (async () => {
    const mysqlConn = await mysql.createConnection(mysqlConfig);
    const pgClient = new Client(pgConfig);
    await pgClient.connect();
    try {
      const [rows] = await mysqlConn.execute("SELECT * FROM branch");
      // console.log("rows",rows)
      for (const row of rows) {
        const row_id = libFunc.randomid();
        const {
          name,
          head_name,
          head_address,
          city_id,
          head_mobile,
          create_date,
          modify_date,
          head_stdcode,
          head_phone,
          head_ophone,
          head_mname,
          head_maddress,
          head_mstdcode,
          head_mphone,
          head_mophone,
          head_mmobile,
          is_active,
          is_delete,
        } = row;
        const cr_on = safeDate(create_date);
        const up_on = safeDate(modify_date);
        const is_active1 = toBool(is_active);
        const is_delete2 = toBool(is_delete);

        //   const data = {
        //     row_id,
        //     branch_name:name,
        //     branch_head_name:head_name,
        //     address:head_address,
        //     city:city_id,
        //     mobile_no:head_mobile,
        //     cr_on,
        //     up_on,
        //     is_active:is_active1,
        //     is_deleted:is_delete2,
        //     head_stdcode,
        //     head_phone,
        //     head_ophone,
        //     head_mname,
        //     head_maddress,
        //     head_mstdcode,
        //     head_mphone,
        //     head_mophone,
        //     head_mmobile,
        // }

        // await query.insert_data(test29branch, data);

        await pgClient.query(
          `
        INSERT INTO ${schema}.test29branch (
          row_id, branch_name, branch_head_name, address, city, mobile_no,
          cr_on, up_on, is_active, is_deleted,
          head_stdcode,head_phone,head_ophone,head_mname,head_maddress,head_mstdcode,head_mphone,head_mophone,
          head_mmobile
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)
        ON CONFLICT (row_id) DO NOTHING
      `,
          [
            row_id,
            name || "",
            head_name || "",
            head_address || "",
            city_id || 0,
            head_mobile || "",
            cr_on,
            up_on,
            toBool(is_active),
            toBool(is_delete),
            head_stdcode,
            head_phone,
            head_ophone,
            head_mname,
            head_maddress,
            head_mstdcode,
            head_mphone,
            head_mophone,
            head_mmobile,
          ]
        );

        // console.log("Data transer response:");
        // console.log(`Inserted branch: ${name}`);
        res.send();
      }
      // console.log('Data migration completed successfully!');
    } catch (err) {
      // console.error('Error during migration:', err.message);
    } finally {
      await mysqlConn.end();
      await pgClient.end();
    }
  })();
}

/**
 * fetch count of record
 */

async function fetchCountRecord(req, res) {
  try {
    let tablename = req.data.tablename;
    if (!tablename) {
      const validation = {
        status: 1,
        msg: "Table name is required",
      };
      // console.log("res", validation)
      return libFunc.sendResponse(res, validation);
    }
    // Use switch-case to map allowed table names
    let selectedTable = "";
    switch (tablename) {
      case "students":
        selectedTable = `${schema}.students`;
        break;
      case "branch":
        selectedTable = `${schema}.branch`;
        break;
      case "users":
        selectedTable = `${schema}.users`;
        break;
      case "centers":
        selectedTable = `${schema}.centers`;
        break;
      case "classes":
        selectedTable = `${schema}.classes`;
        break;
      case "copy_checkers":
        selectedTable = `${schema}.copy_checkers`;
        break;
      case "exam_sessions":
        selectedTable = `${schema}.exam_sessions`;
        break;
      case "marks":
        selectedTable = `${schema}.marks`;
        break;
      case "merit_list":
        selectedTable = `${schema}.merit_list`;
        break;
      case "samplebook":
        selectedTable = `${schema}.samplebook`;
        break;
      case "samplepaper":
        selectedTable = `${schema}.samplepaper`;
        break;
      case "attendance":
        selectedTable = `${schema}.attendance`;
        break;
      case "bandals":
        selectedTable = `${schema}.bandals`;
        break;
      default:
        const handle = {
          status: 1,
          msg: "Invalid table name provided",
        };
        // console.log("resp", handle)
        return libFunc.sendResponse(res, handle);
    }
    // Prepare parameters for counting

    let tablename1 = selectedTable;

    let table_cond = {
      is_deleted: false, // Only count non-deleted records by default
    };

    const fetch = await query.count(tablename1, table_cond);
    // console.log("fetchcount", fetch)
    if (!fetch || fetch.length === 0) {
      const handle = {
        status: 1,
        msg: "No records found.",
        data: [],
      };
      // console.log("resp", handle);
      return libFunc.sendResponse(res, handle);
    }
    const resp = {
      status: 0,
      msg: "Records Fetched successfully",
      data: fetch,
    };
    // console.log("resp", resp);
    libFunc.sendResponse(res, resp);
  } catch (error) {
    // console.error("Error fetching records:", error);
    libFunc.sendResponse(res, {
      status: 1,
      msg: "An error occurred while fetching records",
      error: error.message,
    });
  }
}

/**
 * according to faculty class name fetched
 */

async function fetchClassesByFaculty(req, res) {
  try {
    const {
      faculty,
      limit = 10,
      page = 1,
      showDeleted = false,
    } = req.data || {};

    // if (!faculty) {

    //   return libFunc.sendResponse(res, {
    //     status: 1,
    //     msg: "Faculty ID is required",
    //   });
    // }

    const offset = (page - 1) * limit;

    const cond = {
      AND: {
        [schema + ".classes.faculty"]: faculty,
        [schema + ".classes.is_deleted"]: showDeleted,
      },
    };

    const parameters = {
      tablename: classes,
      data: ["class_name", "row_id"],
      cond: cond,
      orderby: null,
      limit: { LIMIT: limit },
      offset: { OFFSET: offset },
    };

    // console.log("Fetching classes for faculty:", faculty);

    const classList = await query.select_query(parameters);
    // console.log("Fetched classes:", classList);

    if (!classList || classList.length === 0) {
      const handle = {
        status: 1,
        msg: "No class found with the given filters.",
        data: [],
      };
      // console.log("resp", handle);
      return libFunc.sendResponse(res, handle);
    }

    const resp = {
      status: 0,
      msg: "Classes fetched successfully",
      data: classList,
    };

    libFunc.sendResponse(res, resp);
  } catch (error) {
    // console.error("Error fetching classes by faculty:", error);
    libFunc.sendResponse(res, {
      status: 1,
      msg: "An error occurred while fetching classes",
      error: error.message,
    });
  }
}

async function fetchMarks(req, res) {
  try {
    const { exam_session, class_id, copy_checker_id } = req.data;

    // if (!exam_session || !class_id || !gender) {
    //   return libFunc.sendResponse(res, {
    //     status: 1,
    //     msg: "Missing required fields: exam_session, class_id, gender",
    //   });
    // }

    const cond = {
      AND: {
        [schema + ".marks.exam_session"]: exam_session,
      },
    };

    if (copy_checker_id) {
      cond.AND[`${schema}.marks.copy_checker_id`] = copy_checker_id;
    }

    const parameters = {
      tablename: bandals,
      data: [
        `${schema}.students.roll_no`,
        "class_name",
        "name",
        "marks",
        `${students}.mobile_no`,
      ],
      cond: cond,
      joins: [
        {
          jointype: "inner",
          tables: [
            { tb: markstable, on: "student_row_id" },
            { tb: students, on: "row_id" },
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
            { tb: markstable, on: "copy_checker_id" },
            { tb: copyCheckers, on: "row_id" },
          ],
        },
      ],
      // orderby: {
      //   column: "sb.centers.center_code",
      //   order: "ASC",
      // },
    };

    const studentResp = await query.select_query(parameters);

    const resp = {
      status: 0,
      msg: "Marks Report fetched successfully",
      data: studentResp,
    };

    // console.log("Marks Report:", resp);
    libFunc.sendResponse(res, resp);
  } catch (error) {
    // console.error("Error fetching Marks Report students:", error);
    libFunc.sendResponse(res, {
      status: 1,
      msg: "An error occurred while fetching Marks Report",
      error: error.message,
    });
  }
}

/**
 * fetch center wise students
 */

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

    if (orderby) {
      let orderClause = {
        [students + ".roll_no"]: "asc", // default
      };

      if (orderby === "name") {
        orderClause = {
          [students + ".student_name"]: "asc",
          [classes + ".class_name"]: "asc",
        };
      } else if (orderby === "roll_no") {
        orderClause = {
          [students + ".roll_no"]: "asc",
          [classes + ".class_name"]: "asc",
        };
      } else if (orderby === "All") {
        orderClause = {
          [students + ".roll_no"]: "asc",
          [students + ".student_name"]: "asc",
        };
      }

      const cond = {
        AND: {
          [students + ".exam_sessions"]: exam_sessions,
          [students + ".center"]: center,
        },
      };

      if (gender != "All") {
        if (gender === "Female") {
          cond.AND[`${students}.gender`] = "f";
        } else {
          cond.AND[`${students}.gender`] = "m";
        }
      }

      const parameters = {
        tablename: students,
        data: [
          `${students}` + ".student_name",
          `${students}` + ".father_name",
          `${students}` + ".address",
          `${students}` + ".dob",
          `${students}` + ".mobile_no",
          `${students}` + ".ahhar_no",
          `${students}` + ".account_no",
          `${students}` + ".account_name",
          `${students}` + ".bank_name",
          `${students}` + ".ifsc_code",
          `${classes}` + ".class_name",
          `${students}` + ".gender",
          `${students}` + ".roll_no",
          `${students}` + ".center",
          `${centers}` + ".center as center_name",
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

      // 1. Fetch students
      const studentResp = await query.select_query(parameters);

      if (!studentResp || studentResp.length === 0) {
        const handle = {
          status: 1,
          msg: "No students found for the given ordering filters.",
          data: [],
        };
        console.log("resp", handle);
        return libFunc.sendResponse(res, handle);
      }

      // 2. Fetch count separately
      const countParameters = {
        tablename: students,
        data: ["COUNT(*) AS total_students"],
        cond: cond,
      };

      const countResp = await query.select_query(countParameters);

      const classWiseCountParams = {
        tablename: students,
        data: [
          `${classes}.class_name`,
          `COUNT(${students}.row_id) AS total_students`,
        ],
        cond: cond,
        groupby: [`${classes}.class_name`],
        joins: [
          {
            jointype: "inner",
            tables: [
              { tb: students, on: "class_id" },
              { tb: classes, on: "row_id" },
            ],
          },
        ],
      };

      const classWiseCount = await query.select_query(classWiseCountParams);

      const classWiseStudentCount = {
        classWiseCount,
        all_students_count: countResp[0]?.total_students || 0,
      };

      const resp = {
        status: 0,
        msg: "Ordered students fetched successfully.",
        data: studentResp,
        class_wise_count: classWiseCount || [],
        all_students_count: countResp[0]?.total_students || 0,
        // countData: classWiseStudentCount
      };

      console.log("Center Wise Students:", resp);
      return libFunc.sendResponse(res, resp);
    }

    if (state || city) {
      const orConditions = {};
      // if (exam_sessions)
      //   orConditions[`${schema}.students.exam_sessions`] = exam_sessions;
      // if (state) orConditions[`${schema}.students.state`] = state;
      // if (city) orConditions[`${schema}.students.city`] = city;

      const cond = {
        AND: {
          [students + ".exam_sessions"]: exam_sessions,
          [students + ".state"]: state,
          [students + ".city"]: city,
        },
      };

      const parameters = {
        tablename: students,
        data: [
          `${students}` + ".student_name",
          `${students}` + ".father_name",
          `${students}` + ".state",
          `${students}` + ".city",
          `${students}` + ".account_no",
          `${students}` + ".account_name",
          `${students}` + ".bank_name",
          `${students}` + ".ifsc_code",
          `${students}` + ".address",
          `${students}` + ".mobile_no",
          `${students}` + ".education",
          `${students}` + ".roll_no",
          `${classes}` + ".class_name",
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
        ],

        // orderby: {
        //   column: "sb.centers.center_code",
        //   order: "ASC",
        // },
      };

      const studentResp = await query.select_query(parameters);

      if (!studentResp || studentResp.length === 0) {
        const handle = {
          status: 1,
          msg: "No students found for the given state/city filters.",
          data: [],
        };
        console.log("resp", handle);
        return libFunc.sendResponse(res, handle);
      }

      const resp = {
        status: 0,
        msg: "Students filtered by state or city fetched successfully.",
        data: studentResp,
      };

      console.log("State City Wise Student:", resp);
      return libFunc.sendResponse(res, resp);
    }

    if (from_date || to_date) {
      const parameters = `
        SELECT ${students}.student_name,
        ${students}.father_name,
        ${students}.address,
        ${classes}.class_name,
        ${students}.gender,
        ${students}.roll_no,
        ${students}.center,
        ${students}.ahhar_no,
        ${students}.mobile_no,
        ${students}.account_no,
        ${students}.account_name,
        ${students}.ifsc_code,
        ${centers}.center as center_name FROM ${schema}.students   
         INNER JOIN ${centers} ON ${students}.center = ${centers}.row_id 
         INNER JOIN ${classes} ON ${students}.class_id = ${classes}.row_id  
         WHERE ${students}.exam_sessions = '${exam_sessions}' AND ${students}.center = '${center}' AND ${students}.gender = '${gender}'  
        OR ${students}.cr_on BETWEEN '${from_date}' AND '${to_date}'
     ;
        `;

      console.log("parameters--", parameters);

      const studentResp = await query.custom_query(parameters);

      if (!studentResp || studentResp.length === 0) {
        const handle = {
          status: 1,
          msg: "No students found for the given date and gender filters.",
          data: [],
        };
        console.log("resp", handle);
        return libFunc.sendResponse(res, handle);
      }

      const resp = {
        status: 0,
        msg: "Students filtered by date and gender fetched successfully.",
        data: studentResp,
      };

      console.log("Center Wise Students:", resp);
      return libFunc.sendResponse(res, resp);
    }

    if (roll_no || exam_sessions || center) {
      const cond = {
        AND: {
          [students + ".exam_sessions"]: exam_sessions,
          [students + ".center"]: center,
        },
      };

      if (roll_no) {
        cond.AND[`${students}.roll_no`] = roll_no;
      }

      const parameters = {
        tablename: students,
        data: [
          `${students}` + ".student_name",
          `${students}` + ".father_name",
          `${students}` + ".address",
          `${classes}` + ".class_name",
          `${students}` + ".gender",
          `${students}` + ".roll_no",
          `${students}` + ".mobile_no",
          `${students}` + ".center",
          `${centers}` + ".center as center_name",
          `${examSessions}` + ".exam_date",
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
        // orderby: {
        //   column: "sb.centers.center_code",
        //   order: "ASC",
        // },
      };

      const studentResp = await query.select_query(parameters);

      if (!studentResp || studentResp.length === 0) {
        const handle = {
          status: 1,
          msg: "No student found for the given roll number.",
          data: [],
        };
        console.log("resp", handle);
        return libFunc.sendResponse(res, handle);
      }

      const resp = {
        status: 0,
        msg: "Student details fetched successfully for the admission card.",
        data: studentResp,
      };

      console.log("Center Wise Students:", resp);
      return libFunc.sendResponse(res, resp);
    }
  } catch (error) {
    console.error("Error fetching center-wise students:", error);
    libFunc.sendResponse(res, {
      status: 1,
      msg: "An error occurred while fetching center-wise students",
      error: error.message,
    });
  }
}

async function fetchStudentMarksReports(req, res) {
  try {
    const {
      faculty,
      exam_session,
      bandal_no,
      class_id,
      center,
      marksfrom,
      marksto,
    } = req.data;

    if (bandal_no) {
      const cond = {
        AND: {
          [bandals + ".exam_session"]: exam_session,
          // [bandals + ".faculty"]: faculty,
        },
      };

      if (bandal_no) {
        cond.AND[`${bandals}.bandal_no`] = bandal_no;
      }

      const parameters = {
        tablename: bandals,
        data: [
          `${students}` + ".roll_no",
          "bandal_no",
          "class_name",
          // `${students}` + ".name",
          "marks",
          `${copyCheckers}` + ".name as copy_checker",
          "session_name",
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
          {
            jointype: "inner",
            tables: [
              { tb: bandals, on: "exam_session" },
              { tb: examSessions, on: "row_id" },
            ],
          },
        ],
        // orderby: {
        //   column: "sb.centers.center_code",
        //   order: "ASC",
        // },
      };

      const studentResp = await query.select_query(parameters);

      const resp = {
        status: 0,
        msg: "Marks Report fetched successfully",
        data: studentResp,
      };

      console.log("Marks Report:", resp);
      libFunc.sendResponse(res, resp);
    } else {
      const fetchfiltermarks = `
    
      SELECT 
      ${students}.roll_no,
      bandal_no,
      class_name,
      name as copy_checker,
      marks,center_code,${centers}.center as center_name
      FROM ${bandals}
      INNER JOIN ${students} ON ${bandals}.student_row_id = ${students}.row_id
      INNER JOIN  ${classes} ON ${bandals}.class = ${classes}.row_id
      INNER JOIN ${copyCheckers} ON ${bandals}.copy_checker_id = ${copyCheckers}.row_id
      INNER JOIN ${markstable} ON ${bandals}.student_row_id = ${markstable}.student_row_id
      INNER JOIN ${centers}  ON ${centers}.row_id = ${students}.center

      WHERE 
      ${bandals}.exam_session = '${exam_session}'
      AND ${students}.center = '${center}' AND ${bandals}.class = '${class_id}'
      AND marks BETWEEN ${marksfrom} AND ${marksto};
          
          `;

      const studentResp = await query.custom_query(fetchfiltermarks);

      const resp = {
        status: 0,
        msg: "Marks Report fetched successfully",
        data: studentResp,
      };

      console.log("Marks Report:", resp);
      libFunc.sendResponse(res, resp);
    }
  } catch (error) {
    console.error("Error fetching Marks Report students:", error);
    libFunc.sendResponse(res, {
      status: 1,
      msg: "An error occurred while fetching Marks Report",
      error: error.message,
    });
  }
}

async function fetchRejactStudentofExam(req, res) {
  try {
    const { exam_session } = req.data;

    if (!exam_session) {
      const handlemsg = {
        status: 1,
        msg: "Missing required field: exam_session",
      };
      console.log("debug->", handlemsg);
      return libFunc.sendResponse(res, handlemsg);
    }

    num = 2;

    const cond = {
      AND: {
        [attendance + ".exam_session"]: String(exam_session),
        [attendance + ".status"]: 2, // status = 2 (rejected)
      },
    };

    const parameters = {
      tablename: attendance,
      data: [
        `${students}` + ".roll_no",
        `${students}` + ".student_name",
        `${students}` + ".father_name",
        `${students}` + ".mobile_no",
        `${students}` + ".remarks",
        `${students}` + ".address",
        `${centers}` + ".center_code",
        `${centers}` + ".center",
      ],
      cond: cond,
      joins: [
        {
          jointype: "inner",
          tables: [
            { tb: attendance, on: "student_row_id" },
            { tb: students, on: "row_id" },
          ],
        },
        {
          jointype: "inner",
          tables: [
            { tb: attendance, on: "center_code" },
            { tb: centers, on: "row_id" },
          ],
        },
      ],
    };

    const studentResp = await query.select_query(parameters);

    if (!studentResp || studentResp.length === 0) {
      const handle = {
        status: 1,
        msg: "No students found with the given filters.",
        data: [],
      };
      console.log("resp", handle);
      return libFunc.sendResponse(res, handle);
    }

    if (!studentResp || studentResp.length === 0) {
      const handlemsg = {
        status: 1,
        msg: "No rejected students found for this exam session",
        data: [],
      };
      console.log("debug->", handlemsg);
      return libFunc.sendResponse(res, handlemsg);
    }

    const resp = {
      status: 0,
      msg: "Rejected students fetched successfully",
      data: studentResp,
    };

    console.log("Rejected students list:", resp);
    libFunc.sendResponse(res, resp);
  } catch (error) {
    console.error("Error fetching rejected students:", error);
    libFunc.sendResponse(res, {
      status: 1,
      msg: "An error occurred while fetching rejected students",
      error: error.message,
    });
  }
}

// async function fetchMeritlist(req, res) {
//   try {
//     const { faculty, exam_sessions, center, class_id } = req.data;

//     if (!exam_sessions) {
//       return libFunc.sendResponse(res, {
//         status: 1,
//         msg: "Missing required field: exam_sessions",
//       });
//     }

//     const cond = {
//       AND: {
//         [students + ".exam_sessions"]: exam_sessions,
//         [students + ".faculty"]: faculty,
//       },
//     };

//     if (center) {
//       cond.AND[`${students}.center`] = center;
//     }

//     if (class_id) {
//       cond.AND[`${students}.class_id`] = class_id;
//     }

//     const parameters = {
//       tablename: students,
//       data: [
//         `${students}` + ".student_name",
//         `${students}` + ".father_name",
//         `${students}` + ".address",
//         `${students}` + ".mobile_no",
//         `${classes}` + ".class_name",
//         `${students}` + ".gender",
//         `${students}` + ".roll_no",
//         `${students}` + ".center",
//         `${classes}` + ".class_name",
//         `${centers}` + ".center",
//         `${centers}` + ".center_code",
//         "marks",
//       ],
//       cond: cond,
//       joins: [
//         {
//           jointype: "inner",
//           tables: [
//             { tb: students, on: "center" },
//             { tb: centers, on: "row_id" },
//           ],
//         },
//         {
//           jointype: "inner",
//           tables: [
//             { tb: students, on: "class_id" },
//             { tb: classes, on: "row_id" },
//           ],
//         },
//         {
//           jointype: "inner",
//           tables: [
//             { tb: students, on: "row_id" },
//             { tb: markstable, on: "student_row_id" },
//           ],
//         },
//       ],
//     };

//     const studentResp = await query.select_query(parameters);

//     if (!studentResp || studentResp.length === 0) {
//       const handle = {
//         status: 1,
//         msg: "No students found with the given filters.",
//         data: [],
//       };
//       console.log("resp", handle);
//       return libFunc.sendResponse(res, handle);
//     }

//     // Sort students descending by marks
//     studentResp.sort((a, b) => b.marks - a.marks);

//     // Assign position based on sorted marks
//     studentResp.forEach((student, index) => {
//       student.position = index + 1; // 1-based position (1,2,3,4..)
//       student.status = student.marks >= 1490 ? "PASS" : "FAIL";
//     });

//     const resp = {
//       status: 0,
//       msg: "Merit list fetched successfully",
//       data: studentResp,
//     };

//     console.log("Merit list Students response", resp);
//     libFunc.sendResponse(res, resp);
//   } catch (error) {
//     console.error("Error fetching Merit list students:", error);
//     libFunc.sendResponse(res, {
//       status: 1,
//       msg: "An error occurred while fetching Merit list students",
//       error: error.message,
//     });
//   }
// }

// async function fetchMeritlist(req, res) {
//   try {
//     const { faculty, exam_sessions, center, class_id } = req.data;

//     if (!exam_sessions) {
//       return libFunc.sendResponse(res, {
//         status: 1,
//         msg: "Missing required field: exam_sessions",
//       });
//     }

//     const cond = {
//       AND: {
//         [students + ".exam_sessions"]: exam_sessions,
//         [students + ".faculty"]: faculty,
//       },
//     };

//     if (center) {
//       cond.AND[`${students}.center`] = center;
//     }

//     if (class_id) {
//       cond.AND[`${students}.class_id`] = class_id;
//     }

//     const parameters = {
//       tablename: students,
//       data: [
//         `${students}` + ".student_name",
//         `${students}` + ".father_name",
//         `${students}` + ".address",
//         `${students}` + ".mobile_no",
//         `${classes}` + ".class_name",
//         `${students}` + ".gender",
//         `${students}` + ".roll_no",
//         `${students}` + ".center",
//         `${classes}` + ".class_name",
//         `${centers}` + ".center",
//         `${centers}` + ".center_code",
//         `${classes}.first_price`,
//         `${classes}.second_price`,
//         `${classes}.third_price`,
//         `${classes}.marks_greater_equal_to_90`,
//         `${classes}.marks_70_to_less_then_90`,
//         `${classes}.marks_50_to_less_then_70`,

//         "marks",
//       ],
//       cond: cond,
//       joins: [
//         {
//           jointype: "inner",
//           tables: [
//             { tb: students, on: "center" },
//             { tb: centers, on: "row_id" },
//           ],
//         },
//         {
//           jointype: "inner",
//           tables: [
//             { tb: students, on: "class_id" },
//             { tb: classes, on: "row_id" },
//           ],
//         },
//         {
//           jointype: "inner",
//           tables: [
//             { tb: students, on: "row_id" },
//             { tb: markstable, on: "student_row_id" },
//           ],
//         },
//       ],
//     };

//     const studentResp = await query.select_query(parameters);

//     if (!studentResp || studentResp.length === 0) {
//       const handle = {
//         status: 1,
//         msg: "No students found with the given filters.",
//         data: [],
//       };
//       console.log("resp", handle);
//       return libFunc.sendResponse(res, handle);
//     }

//     // Sort students descending by marks
//     studentResp.sort((a, b) => b.marks - a.marks);

//     const FULL_MARKS = 500;

//     studentResp.forEach((student, index) => {
//       student.position = index + 1;
//       student.status = student.marks > 50 ? "PASS" : "FAIL";

//       const marksPercentage = (student.marks / FULL_MARKS) * 100;

//       let prize = 0;

//       if (student.position === 1 && student.first_price != null) {
//         prize = student.first_price;
//       } else if (student.position === 2 && student.second_price != null) {
//         prize = student.second_price;
//       } else if (student.position === 3 && student.third_price != null) {
//         prize = student.third_price;
//       } else {
//         if (
//           marksPercentage >= 90 &&
//           student.marks_greater_equal_to_90 != null
//         ) {
//           prize = student.marks_greater_equal_to_90;
//         } else if (
//           marksPercentage >= 70 &&
//           marksPercentage < 90 &&
//           student.marks_70_to_less_then_90 != null
//         ) {
//           prize = student.marks_70_to_less_then_90;
//         } else if (
//           marksPercentage >= 50 &&
//           marksPercentage < 70 &&
//           student.marks_50_to_less_then_70 != null
//         ) {
//           prize = student.marks_50_to_less_then_70;
//         }
//       }

//       student.marksPercentage = parseFloat(marksPercentage.toFixed(2));
//       student.prize = prize;
//     });

//     const resp = {
//       status: 0,
//       msg: "Merit list fetched successfully",
//       data: studentResp,
//     };

//     console.log("Merit list Students response", resp);
//     libFunc.sendResponse(res, resp);
//   } catch (error) {
//     console.error("Error fetching Merit list students:", error);
//     libFunc.sendResponse(res, {
//       status: 1,
//       msg: "An error occurred while fetching Merit list students",
//       error: error.message,
//     });
//   }
// }

async function fetchMeritlist(req, res) {
  try {
    const { faculty, exam_sessions, center, class_id, account_no } = req.data;

    if (!exam_sessions) {
      return libFunc.sendResponse(res, {
        status: 1,
        msg: "Missing required field: exam_sessions",
      });
    }

    // Prepare condition for WHERE clause
    const cond = {
      AND: {
        [`${students}.exam_sessions`]: exam_sessions,
        [`${students}.faculty`]: faculty,
      },
    };

    if (center) {
      cond.AND[`${students}.center`] = center;
    }

    if (class_id) {
      cond.AND[`${students}.class_id`] = class_id;
    }

    // Handle account_no separately for SQL NULL condition
    let accountCondition = "";
    if (account_no === "with") {
      accountCondition = ` AND ${students}.account_no IS NOT NULL`;
    } else if (account_no === "without") {
      accountCondition = ` AND ${students}.account_no IS NULL`;
    }

    // Prepare WHERE clause using helper
    const whereClause = prepareWhereClause(cond) + accountCondition;

    const queryStr = `
      SELECT 
        ${students}.student_name,
        ${students}.father_name,
        ${students}.address,
        ${students}.mobile_no,
        ${classes}.class_name,
        ${students}.gender,
        ${students}.roll_no,
        ${students}.center,
        ${classes}.first_price,
        ${classes}.second_price,
        ${classes}.third_price,
        ${classes}.marks_greater_equal_to_90,
        ${classes}.marks_70_to_less_then_90,
        ${classes}.marks_50_to_less_then_70,
        ${centers}.center AS center_name,
        ${centers}.center_code,
        ${markstable}.marks
      FROM ${students}
      INNER JOIN ${centers} ON ${students}.center = ${centers}.row_id
      INNER JOIN ${classes} ON ${students}.class_id = ${classes}.row_id
      INNER JOIN ${markstable} ON ${students}.row_id = ${markstable}.student_row_id
      ${whereClause}
    `;

    const { rows: studentResp } = await pool.query(queryStr);

    if (!studentResp || studentResp.length === 0) {
      return libFunc.sendResponse(res, {
        status: 1,
        msg: "No students found with the given filters.",
        data: [],
      });
    }

    // Sort and enrich student records
    studentResp.sort((a, b) => b.marks - a.marks);

    const FULL_MARKS = 500;

    studentResp.forEach((student, index) => {
      student.position = index + 1;
      student.status = student.marks > 50 ? "PASS" : "FAIL";

      const marksPercentage = (student.marks / FULL_MARKS) * 100;
      let prize = 0;

      if (student.position === 1 && student.first_price != null) {
        prize = student.first_price;
      } else if (student.position === 2 && student.second_price != null) {
        prize = student.second_price;
      } else if (student.position === 3 && student.third_price != null) {
        prize = student.third_price;
      } else {
        if (
          marksPercentage >= 90 &&
          student.marks_greater_equal_to_90 != null
        ) {
          prize = student.marks_greater_equal_to_90;
        } else if (
          marksPercentage >= 70 &&
          marksPercentage < 90 &&
          student.marks_70_to_less_then_90 != null
        ) {
          prize = student.marks_70_to_less_then_90;
        } else if (
          marksPercentage >= 50 &&
          marksPercentage < 70 &&
          student.marks_50_to_less_then_70 != null
        ) {
          prize = student.marks_50_to_less_then_70;
        }
      }

      student.marksPercentage = parseFloat(marksPercentage.toFixed(2));
      student.prize = prize;
    });

    return libFunc.sendResponse(res, {
      status: 0,
      msg: "Merit list fetched successfully",
      data: studentResp,
    });
  } catch (error) {
    console.error("Error fetching Merit list students:", error);
    libFunc.sendResponse(res, {
      status: 1,
      msg: "An error occurred while fetching Merit list students",
      error: error.message,
    });
  }
}

// sample book
async function createOrUpdateSampleBook(req, res) {
  try {
    let { row_id, title, photo_path } = req.data;

    if (!title) {
      return libFunc.sendResponse(res, {
        status: 1,
        msg: "Missing required field: title",
      });
    }

    let response;

    if (row_id) {
      // ========== Update SampleBook ==========
      const updateData = {
        title,
        photo_path,
        up_on: new Date().toISOString(),
      };

      await query.update_data(sampleBook, updateData, { row_id: row_id });

      response = {
        status: 0,
        msg: "SampleBook updated successfully",
      };
    } else {
      // ========== Create SampleBook ==========
      row_id = libFunc.randomid();

      const createData = {
        row_id,
        title,
        photo_path,
        cr_on: new Date().toISOString(),
        up_on: new Date().toISOString(),
        is_active: true,
        is_deleted: false,
      };

      await query.insert_data(sampleBook, createData);

      response = {
        status: 0,
        msg: "SampleBook created successfully",
      };
    }

    console.log("SampleBook response:", response);
    libFunc.sendResponse(res, response);
  } catch (error) {
    console.error("Error creating/updating sampleBook:", error);
    libFunc.sendResponse(res, {
      status: 1,
      msg: "An error occurred while creating/updating sampleBook",
      error: error.message,
    });
  }
}

// soft del

async function softDeleteOrStatusChangeSampleBook(req, res) {
  try {
    const { row_id, is_deleted, is_active } = req.data;

    if (!row_id) {
      const resp = {
        status: 1,
        msg: "row_id is required",
      };

      console.log("resp", resp);
      return libFunc.sendResponse(res, resp);
    }

    const updateData = {
      up_on: new Date().toISOString(),
    };

    let messages = [];

    if (typeof is_deleted !== "undefined") {
      updateData.is_deleted = is_deleted;
      if (is_deleted) {
        messages.push("class soft-deleted successfully");
      } else {
        messages.push("class restored successfully");
      }
    }

    if (typeof is_active !== "undefined") {
      updateData.is_active = is_active;
      if (is_active) {
        messages.push("class activated successfully");
      } else {
        messages.push("class deactivated successfully");
      }
    }

    if (Object.keys(updateData).length === 1) {
      const resp = {
        status: 1,
        msg: "Nothing to update. Provide is_deleted or is_active.",
      };

      console.log("resp", resp);
      // Only up_on exists
      return libFunc.sendResponse(res, resp);
    }

    // Update branch
    await query.update_data(sampleBook, updateData, { row_id: row_id });

    const response = {
      status: 0,
      msg: messages.join(" & "), // Join messages if both updated
    };

    console.log("updateBranchStatus Response:", response);
    libFunc.sendResponse(res, response);
  } catch (error) {
    console.error("Error updating branch class:", error);
    libFunc.sendResponse(res, {
      status: 1,
      msg: "An error occurred while updating branch class",
      error: error.message,
    });
  }
}

async function fetchSampleBook(req, res) {
  try {
    // Destructure and sanitize pagination parameters
    let { limit = 5, page = 1, showDeleted = false } = req.data;

    const offset = (page - 1) * limit;

    const cond = {};
    if (!showDeleted) {
      cond.is_deleted = false; // Only non-deleted branches if not requested explicitly
    }

    // Query to fetch bandals with pagination
    const parameters = {
      tablename: sampleBook,
      cond: cond,
      orderby: null, // Sorting by created date
      limit: { LIMIT: limit },
      offset: { OFFSET: offset },
    };

    const fetchSampleBook = await query.select_query(parameters);

    if (!fetchSampleBook || fetchSampleBook.length === 0) {
      const handle = {
        status: 1,
        msg: "No SampleBook found with the given filters.",
        data: [],
      };
      console.log("resp", handle);
      return libFunc.sendResponse(res, handle);
    }

    const resp = {
      status: 0,
      msg: "SampleBook fetched successfully",
      data: fetchSampleBook,
    };

    console.log("resp", resp);
    // Send response with bandals data and pagination info
    libFunc.sendResponse(res, resp);
  } catch (error) {
    console.error("Error fetching SampleBook:", error);
    libFunc.sendResponse(res, {
      status: 1,
      msg: "An error occurred while fetching SampleBook",
      error: error.message,
    });
  }
}

// create SamplePaper

async function createOrUpdateSamplePaper(req, res) {
  try {
    let { row_id, class_id, title, photo_path } = req.data;

    if (!class_id || !title) {
      return libFunc.sendResponse(res, {
        status: 1,
        msg: "Missing required fields: class_id or title",
      });
    }

    let response;

    if (row_id) {
      // ========== Update SamplePaper ==========
      const updateData = {
        class_id,
        title,
        photo_path,
        up_on: new Date().toISOString(),
      };

      await query.update_data(samplepaper, updateData, { row_id: row_id });

      response = {
        status: 0,
        msg: "SamplePaper updated successfully",
      };
    } else {
      // ========== Create SamplePaper ==========
      row_id = libFunc.randomid();

      const createData = {
        row_id,
        class_id,
        title,
        photo_path,
        cr_on: new Date().toISOString(),
        up_on: new Date().toISOString(),
        is_active: true,
        is_deleted: false,
      };

      await query.insert_data(samplepaper, createData);

      response = {
        status: 0,
        msg: "SamplePaper created successfully",
      };
    }

    console.log("SamplePaper response:", response);
    libFunc.sendResponse(res, response);
  } catch (error) {
    console.error("Error creating/updating SamplePaper:", error);
    libFunc.sendResponse(res, {
      status: 1,
      msg: "An error occurred while creating/updating SamplePaper",
      error: error.message,
    });
  }
}

// soft del

async function softDeleteOrStatusChangeSamplePaper(req, res) {
  try {
    const { row_id, is_deleted, is_active } = req.data;

    if (!row_id) {
      const resp = {
        status: 1,
        msg: "row_id is required",
      };

      console.log("resp", resp);
      return libFunc.sendResponse(res, resp);
    }

    const updateData = {
      up_on: new Date().toISOString(),
    };

    let messages = [];

    if (typeof is_deleted !== "undefined") {
      updateData.is_deleted = is_deleted;
      if (is_deleted) {
        messages.push("SamplePaper soft-deleted successfully");
      } else {
        messages.push("class restored successfully");
      }
    }

    if (typeof is_active !== "undefined") {
      updateData.is_active = is_active;
      if (is_active) {
        messages.push("SamplePaper activated successfully");
      } else {
        messages.push("SamplePaper deactivated successfully");
      }
    }

    if (Object.keys(updateData).length === 1) {
      const resp = {
        status: 1,
        msg: "Nothing to update. Provide is_deleted or is_active.",
      };

      console.log("resp", resp);
      // Only up_on exists
      return libFunc.sendResponse(res, resp);
    }

    // Update branch
    await query.update_data(sampleBook, updateData, { row_id: row_id });

    const response = {
      status: 0,
      msg: messages.join(" & "), // Join messages if both updated
    };

    console.log(" Response:", response);
    libFunc.sendResponse(res, response);
  } catch (error) {
    console.error("Error updating SamplePaper:", error);
    libFunc.sendResponse(res, {
      status: 1,
      msg: "An error occurred while updating SamplePaper",
      error: error.message,
    });
  }
}

async function fetchSamplePaper(req, res) {
  try {
    // Destructure and sanitize pagination parameters
    let { limit = 5, page = 1, showDeleted = false } = req.data;

    const offset = (page - 1) * limit;

    const cond = {};
    if (!showDeleted) {
      cond["samplepaper.is_deleted"] = false; // Specify table name
    }

    // Query to fetch bandals with pagination
    const parameters = {
      tablename: samplepaper,
      data: ["classes.class_name", "title"],
      cond: cond,
      joins: [
        {
          jointype: "inner",
          tables: [
            { tb: samplepaper, on: "class_id" },
            { tb: classes, on: "row_id" },
          ],
        },
      ],
      orderby: null, // Sorting by created date
      limit: { LIMIT: limit },
      offset: { OFFSET: offset },
    };

    const fetchSamplePaper = await query.select_query(parameters);

    if (!fetchSamplePaper || fetchSamplePaper.length === 0) {
      const handle = {
        status: 1,
        msg: "No SamplePaper found with the given filters.",
        data: [],
      };
      console.log("resp", handle);
      return libFunc.sendResponse(res, handle);
    }

    const resp = {
      status: 0,
      msg: "SamplePaper fetched successfully",
      data: fetchSamplePaper,
    };

    console.log("resp", resp);
    // Send response with bandals data and pagination info
    libFunc.sendResponse(res, resp);
  } catch (error) {
    console.error("Error fetching SamplePaper:", error);
    libFunc.sendResponse(res, {
      status: 1,
      msg: "An error occurred while fetching SamplePaper",
      error: error.message,
    });
  }
}

async function createUpdateEvents(req, res) {
  try {
    const { row_id, event_name, event_date } = req.data;

    if (row_id) {
      // If row_id exists → UPDATE branch
      const updateData = {
        event_name,
        event_date,
        up_on: new Date().toISOString(), // Update the time
      };

      await query.update_data(event, updateData, { row_id: row_id });

      const response = {
        status: 0,
        msg: "event updated successfully",
      };
      // console.log("resp", response);
      libFunc.sendResponse(res, response);
    } else {
      // If row_id not provided → CREATE new branch
      const newRowId = libFunc.randomid();

      const insertData = {
        row_id: newRowId,
        event_name,
        event_date,
      };

      const data = await query.insert_data(event, insertData);

      const response = {
        status: 0,
        msg: "event created successfully",
        data: data,
      };
      // console.log("resp", response);
      libFunc.sendResponse(res, response);
    }
  } catch (error) {
    // console.error("Error creating/updating branch:", error);
    libFunc.sendResponse(res, {
      status: 1,
      msg: "An error occurred while creating/updating the branch",
      error: error.message,
    });
  }
}

async function fetchEvents(req, res) {
  try {
    // Destructure and sanitize pagination parameters
    let { limit = 5, page = 1, showDeleted = false } = req.data;

    const offset = (page - 1) * limit;

    const cond = {};
    if (!showDeleted) {
      cond.is_deleted = false; // Only non-deleted branches if not requested explicitly
    }

    // Query to fetch bandals with pagination
    const parameters = {
      tablename: event,
      cond: cond,
      orderby: null, // Sorting by created date
      limit: { LIMIT: limit },
      offset: { OFFSET: offset },
    };

    const fetchEvents = await query.select_query(parameters);

    if (!fetchEvents || fetchEvents.length === 0) {
      const handle = {
        status: 1,
        msg: "No Events found with the given filters.",
        data: [],
      };
      console.log("resp", handle);
      return libFunc.sendResponse(res, handle);
    }

    const resp = {
      status: 0,
      msg: "Events fetched successfully",
      data: fetchEvents,
    };

    console.log("resp", resp);
    // Send response with bandals data and pagination info
    libFunc.sendResponse(res, resp);
  } catch (error) {
    console.error("Error fetching Events:", error);
    libFunc.sendResponse(res, {
      status: 1,
      msg: "An error occurred while fetching Events",
      error: error.message,
    });
  }
}

/***
 * reports
 */

async function fetchCenterWiseTotalStudentReport(req, res) {
  const { exam_sessions, center, gender, orderby } = req.data;

  // exam_sessions is mandatory
  if (!exam_sessions || !gender || !orderby) {
    const handle = {
      status: 1,
      msg: "missing required feild is required.",
      data: [],
    };
    console.log("res", handle);
    return libFunc.sendResponse(res, handle);
  }

  // Default order clause
  let orderClause = {
    [`${students}.roll_no`]: "asc",
  };

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
  } else if (orderby === "All") {
    orderClause = {
      [`${students}.roll_no`]: "asc",
      [`${students}.student_name`]: "asc",
    };
  }

  // Building condition
  const cond = {
    AND: {
      [`${students}.exam_sessions`]: exam_sessions,
    },
  };

  if (center) {
    cond.AND[`${students}.center`] = center;
  }

  if (gender !== "All") {
    cond.AND[`${students}.gender`] = gender;
  }

  const parameters = {
    tablename: students,
    data: [
      `${students}.student_name`,
      `${students}.father_name`,
      `${students}.address`,
      `${students}.dob`,
      `${students}.mobile_no`,
      `${students}.ahhar_no`,
      `${students}.account_no`,
      `${students}.account_name`,
      `${students}.bank_name`,
      `${students}.ifsc_code`,
      `${classes}.class_name`,
      `${students}.gender`,
      `${students}.roll_no`,
      `${students}.center`,
      `${centers}.center as center_name`,
    ],
    cond,
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
  if (!studentResp || studentResp.length === 0) {
    const handle = {
      status: 1,
      msg: "No students found for the given filters.",
      data: [],
    };
    console.log("res", handle);
    return libFunc.sendResponse(res, handle);
  }

  // Total student count
  const countParameters = {
    tablename: students,
    data: ["COUNT(*) AS total_students"],
    cond,
  };
  const countResp = await query.select_query(countParameters);

  // Class-wise count
  const classWiseCountParams = {
    tablename: students,
    data: [
      `${classes}.class_name`,
      `COUNT(${students}.row_id) AS total_students`,
    ],
    cond,
    groupby: [`${classes}.class_name`],
    joins: [
      {
        jointype: "inner",
        tables: [
          { tb: students, on: "class_id" },
          { tb: classes, on: "row_id" },
        ],
      },
    ],
  };
  const classWiseCount = await query.select_query(classWiseCountParams);

  const handle = {
    status: 0,
    msg: "Ordered students fetched successfully.",
    data: studentResp,
    class_wise_count: classWiseCount,
    all_students_count: countResp[0]?.total_students || 0,
  };
  console.log("res", handle);

  return libFunc.sendResponse(res, handle);
}

async function fetchStudentsByStateOrCity(req, res) {
  const { exam_sessions, state, city } = req.data;

  // Validate required field
  if (!exam_sessions) {
    const handle = {
      status: 1,
      msg: "exam_sessions is required.",
      data: [],
    };
    console.log("res", handle);

    return libFunc.sendResponse(res, handle);
  }

  // Build dynamic condition
  const cond = {
    AND: {
      [`${students}.exam_sessions`]: exam_sessions,
    },
  };

  if (state || state === 0) {
    cond.AND[`${students}.state`] = state;
  }

  if (city || city === 0) {
    cond.AND[`${students}.city`] = city;
  }

  const parameters = {
    tablename: students,
    data: [
      `${students}.student_name`,
      `${students}.father_name`,
      `${students}.state`,
      `${students}.city`,
      `${students}.account_no`,
      `${students}.account_name`,
      `${students}.bank_name`,
      `${students}.ifsc_code`,
      `${students}.address`,
      `${students}.mobile_no`,
      `${students}.education`,
      `${students}.roll_no`,
      `${classes}.class_name`,
    ],
    cond,
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
  if (!studentResp || studentResp.length === 0) {
    const handle = {
      status: 1,
      msg: "No students found for the given state/city filters.",
      data: [],
    };
    console.log("res", handle);
    return libFunc.sendResponse(res, handle);
  }

  const handle = {
    status: 0,
    msg: "Students filtered by state or city fetched successfully.",
    data: studentResp,
  };
  console.log("res", handle);

  return libFunc.sendResponse(res, handle);
}

async function fetchCenterWiseStudent(req, res) {
  const { from_date, to_date, exam_sessions, center, gender } = req.data;

  if (!exam_sessions || !gender) {
    const handle = {
      status: 1,
      msg: "exam_sessions is required.",
      data: [],
    };
    console.log("res", handle);
    return libFunc.sendResponse(res, handle);
  }

  let whereClauses = [`${students}.exam_sessions = '${exam_sessions}'`];

  if (center) {
    whereClauses.push(`${students}.center = '${center}'`);
  }

  if (gender !== "All") {
    whereClauses.push(`${students}.gender = '${gender}'`);
  }

  if (from_date && to_date) {
    whereClauses.push(
      `${students}.cr_on BETWEEN '${from_date}' AND '${to_date}'`
    );
  }

  const whereClause =
    whereClauses.length > 0 ? "WHERE " + whereClauses.join(" AND ") : "";

  const queryStr = `
    SELECT ${students}.student_name,
           ${students}.father_name,
           ${students}.address,
           ${classes}.class_name,
           ${students}.gender,
           ${students}.roll_no,
           ${students}.center,
           ${students}.ahhar_no,
           ${students}.mobile_no,
           ${students}.account_no,
           ${students}.account_name,
           ${students}.ifsc_code,
           ${centers}.center as center_name
    FROM ${schema}.students
    INNER JOIN ${centers} ON ${students}.center = ${centers}.row_id
    INNER JOIN ${classes} ON ${students}.class_id = ${classes}.row_id
    ${whereClause}
  `;

  const studentResp = await query.custom_query(queryStr);
  if (!studentResp || studentResp.length === 0) {
    const handle = {
      status: 1,
      msg: "No students found for the given filters.",
      data: [],
    };
    console.log("res", handle);
    return libFunc.sendResponse(res, handle);
  }

  const handle = {
    status: 0,
    msg: "Students fetched successfully.",
    data: studentResp,
  };
  console.log("res", handle);
  return libFunc.sendResponse(res, handle);
}

async function fetchAdmissionCardReport(req, res) {
  const { exam_sessions, center, roll_no } = req.data;

  if (!exam_sessions || !center) {
    const missingFields = [];
    if (!exam_sessions) missingFields.push("exam_sessions");
    if (!center) missingFields.push("center");

    const handle = {
      status: 1,
      msg: `Missing required field(s): ${missingFields.join(", ")}`,
      data: [],
    };
    console.log("res", handle);
    return libFunc.sendResponse(res, handle);
  }

  const cond = {
    AND: {
      [`${students}.exam_sessions`]: exam_sessions,
    },
  };

  if (center) {
    cond.AND[`${students}.center`] = center;
  }

  if (roll_no) {
    cond.AND[`${students}.roll_no`] = roll_no;
  }

  const parameters = {
    tablename: students,
    data: [
      `${students}.student_name`,
      `${students}.father_name`,
      `${students}.address`,
      `${classes}.class_name`,
      `${students}.gender`,
      `${students}.roll_no`,
      `${students}.mobile_no`,
      `${students}.center`,
      `${centers}.center as center_name`,
      `${examSessions}.exam_date`,
    ],
    cond,
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
  if (!studentResp || studentResp.length === 0) {
    const handle = {
      status: 1,
      msg: "No student found for the given filters.",
      data: [],
    };
    console.log("res", handle);
    return libFunc.sendResponse(res, handle);
  }

  const handle = {
    status: 0,
    msg: "Student details fetched successfully for the admission card.",
    data: studentResp,
  };
  console.log("res", handle);
  return libFunc.sendResponse(res, handle);
}

async function marksreport(req, res) {
  const { exam_session, bandal_no } = req.data;

  if (!exam_session) {
    const handle = {
      status: 1,
      msg: "exam_session is required.",
      data: [],
    };
    console.log("res", handle);
    return libFunc.sendResponse(res);
  }

  const cond = {
    AND: {
      [`${bandals}.exam_session`]: exam_session,
    },
  };

  if (bandal_no) {
    cond.AND[`${bandals}.bandal_no`] = bandal_no;
  }

  const parameters = {
    tablename: bandals,
    data: [
      `${students}.roll_no`,
      "bandal_no",
      "class_name",
      "marks",
      `${copyCheckers}.name as copy_checker`,
      "session_name",
    ],
    cond,
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
      {
        jointype: "inner",
        tables: [
          { tb: bandals, on: "exam_session" },
          { tb: examSessions, on: "row_id" },
        ],
      },
    ],
  };

  const studentResp = await query.select_query(parameters);
  if (!studentResp || studentResp.length === 0) {
    const handle = {
      status: 1,
      msg: "No student found for the given filters.",
      data: [],
    };
    console.log("res", handle);
    return libFunc.sendResponse(res, handle);
  }

  const handle = {
    status: 0,
    msg: "Marks Report fetched successfully",
    data: studentResp,
  };
  console.log("res", handle);
  return libFunc.sendResponse(res);
}

async function MarksFilterReport(req, res) {
  const { exam_session, class_id, center, marksfrom, marksto } = req.data;

  // Validate required fields
  if (!exam_session || marksfrom === undefined || marksto === undefined) {
    const handle = {
      status: 1,
      msg: "exam_session, marksfrom, and marksto are required.",
      data: [],
    };
    console.log("res", handle);
    return libFunc.sendResponse(res);
  }

  // Base query
  let fetchfiltermarks = `
    SELECT 
      ${students}.roll_no,
      bandal_no,
      class_name,
      name as copy_checker,
      marks,
      center_code,
      ${centers}.center as center_name
    FROM ${bandals}
    INNER JOIN ${students} ON ${bandals}.student_row_id = ${students}.row_id
    INNER JOIN ${classes} ON ${bandals}.class = ${classes}.row_id
    INNER JOIN ${copyCheckers} ON ${bandals}.copy_checker_id = ${copyCheckers}.row_id
    INNER JOIN ${markstable} ON ${bandals}.student_row_id = ${markstable}.student_row_id
    INNER JOIN ${centers} ON ${centers}.row_id = ${students}.center
    WHERE 
      ${bandals}.exam_session = '${exam_session}'
      AND marks BETWEEN ${marksfrom} AND ${marksto}
  `;

  // Add optional filters
  if (center) {
    fetchfiltermarks += ` AND ${students}.center = '${center}'`;
  }

  if (class_id) {
    fetchfiltermarks += ` AND ${bandals}.class = '${class_id}'`;
  }

  const studentResp = await query.custom_query(fetchfiltermarks);
  if (!studentResp || studentResp.length === 0) {
    const handle = {
      status: 1,
      msg: "No student found for the given filters.",
      data: [],
    };
    console.log("res", handle);
    return libFunc.sendResponse(res, handle);
  }

  const handle = {
    status: 0,
    msg: "Marks Report fetched successfully",
    data: studentResp,
  };
  console.log("res", handle);
  return libFunc.sendResponse(res);
}
