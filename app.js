// Grade calculator rendered in the browser using the same weights as calculator.py.

const COURSE_DATA = {
  AER210: {
    code: "AER210",
    assignments: [
      { name: "Flow Visualization", weight: 5 },
      { name: "Microfludics", weight: 7 },
      { name: "Midterm 1", weight: 19 },
      { name: "Midterm 2", weight: 19 },
      { name: "Exam", weight: 50 },
    ],
  },
  CHE260: {
    code: "CHE260",
    assignments: [
      { name: "Ideal Gas Lab", weight: 5 },
      { name: "First Law Lab", weight: 5 },
      { name: "Quiz 1", weight: 15 },
      { name: "Quiz 2", weight: 15 },
      { name: "Midterm", weight: 30 },
      { name: "Exam", weight: 30 },
    ],
  },
  ECE253: {
    code: "ECE253",
    assignments: [
      { name: "Labs (Best 5 of 9)", weight: 20 },
      { name: "Midterm", weight: 30 },
      { name: "Exam", weight: 50 },
    ],
  },
  ESC203: {
    code: "ESC203",
    assignments: [
      { name: "ANT", weight: 15 },
      { name: "Seminar Participation", weight: 20 },
      { name: "Quizzes (Best 7 of 9)", weight: 10 },
      { name: "Midterm", weight: 20 },
      { name: "Exam", weight: 35 },
    ],
  },
  MAT292: {
    code: "MAT292",
    assignments: [
      { name: "Quizzes (Best 7 of 9)", weight: 10 },
      { name: "Midterm", weight: 20 },
      { name: "Project - Proposal", weight: 5 },
      { name: "Project - Check-ins", weight: 5 },
      { name: "Project - Final Report", weight: 10 },
      { name: "Project - Code", weight: 10 },
      { name: "Exam", weight: 40 },
    ],
  },
  PHY293: {
    code: "PHY293",
    assignments: [
      { name: "Tutorial Quizzes", weight: 8 },
      { name: "Post Class Quizzes (Best 28 of 32)", weight: 2 },
      { name: "Mathmatize (Bonus, 14 out of 18 points)", weight: 1 },
      { name: "Midterm 1", weight: 15 },
      { name: "Midterm 2", weight: 15 },
      { name: "Resistance Lab", weight: 5 },
      { name: "One-weight Lab", weight: 5 },
      { name: "Two-weight Lab", weight: 10 },
      { name: "Exam", weight: 40 },
    ],
  },
};

const COURSE_ORDER = [
  "AER210",
  "CHE260",
  "ECE253",
  "ESC203",
  "MAT292",
  "PHY293",
];

const GPA_SCALE = [
  { min: 90, max: 100, gpa: 4.0, letter: "A+" },
  { min: 85, max: 89, gpa: 4.0, letter: "A" },
  { min: 80, max: 84, gpa: 3.7, letter: "A-" },
  { min: 77, max: 79, gpa: 3.3, letter: "B+" },
  { min: 73, max: 76, gpa: 3.0, letter: "B" },
  { min: 70, max: 72, gpa: 2.7, letter: "B-" },
  { min: 67, max: 69, gpa: 2.3, letter: "C+" },
  { min: 63, max: 66, gpa: 2.0, letter: "C" },
  { min: 60, max: 62, gpa: 1.7, letter: "C-" },
  { min: 57, max: 59, gpa: 1.3, letter: "D+" },
  { min: 53, max: 56, gpa: 1.0, letter: "D" },
  { min: 50, max: 52, gpa: 0.7, letter: "D-" },
  { min: 0, max: 49, gpa: 0.0, letter: "F" },
];

let selectedCourses = new Set();

const courseListEl = document.getElementById("course-list");
const coursesContainer = document.getElementById("courses-container");
const summaryEl = document.getElementById("summary");

function totalWeight(course) {
  return course.assignments.reduce((sum, a) => sum + a.weight, 0);
}

function renderCourseList() {
  courseListEl.innerHTML = "";

  COURSE_ORDER.forEach((code) => {
    const course = COURSE_DATA[code];
    const wrapper = document.createElement("div");
    wrapper.className = "course-option";
    if (selectedCourses.has(code)) {
      wrapper.classList.add("selected");
    }
    wrapper.addEventListener("click", () => {
      const isSelected = selectedCourses.has(code);
      handleCourseToggle(code, !isSelected);
    });

    const info = document.createElement("div");
    info.className = "info";
    const title = document.createElement("div");
    title.className = "course-code";
    title.textContent = course.code;
    const meta = document.createElement("div");
    meta.className = "meta";
    meta.textContent = `${course.assignments.length} assessments`;

    info.appendChild(title);
    info.appendChild(meta);
    wrapper.appendChild(info);
    courseListEl.appendChild(wrapper);
  });
}

function handleCourseToggle(code, shouldSelect) {
  if (shouldSelect) {
    selectedCourses.add(code);
  } else {
    selectedCourses.delete(code);
  }
  renderCourseSections();
  renderCourseList();
  setSummaryPlaceholder();
}

function renderCourseSections() {
  const savedInputs = captureCourseInputs();
  const savedOutputs = captureCourseOutputs();
  coursesContainer.innerHTML = "";

  if (!selectedCourses.size) {
    const placeholder = document.createElement("p");
    placeholder.className = "placeholder";
    placeholder.textContent = "Select a course to start entering grades.";
    coursesContainer.appendChild(placeholder);
    return;
  }

  Array.from(selectedCourses).forEach((code) => {
    const course = COURSE_DATA[code];
    const card = document.createElement("div");
    card.className = "course-card";
    card.dataset.courseCard = code;

    const header = document.createElement("header");
    const title = document.createElement("div");
    title.className = "course-code";
    title.textContent = course.code;
    const weightInfo = document.createElement("div");
    weightInfo.className = "weights";
    weightInfo.textContent = `${course.assignments.length} assessments • ${totalWeight(
      course
    )}% total`;

    header.appendChild(title);
    header.appendChild(weightInfo);
    card.appendChild(header);

    const assignmentsEl = document.createElement("div");
    assignmentsEl.className = "assignments";

    course.assignments.forEach((assignment) => {
      const row = document.createElement("div");
      row.className = "assignment-row";

      const name = document.createElement("div");
      name.className = "assignment-name";
      name.textContent = assignment.name;

      const weight = document.createElement("div");
      weight.className = "assignment-weight";
      weight.textContent = `${assignment.weight}%`;

      const input = document.createElement("input");
      input.type = "text";
      input.placeholder = "";
      input.setAttribute("data-assignment", assignment.name);
      input.setAttribute("data-course", code);

      row.appendChild(name);
      row.appendChild(weight);
      row.appendChild(input);
      assignmentsEl.appendChild(row);
    });

    const goalRow = document.createElement("div");
    goalRow.className = "goal";
    const goalLabel = document.createElement("span");
    goalLabel.textContent = "Goal grade (%)";
    const goalInput = document.createElement("input");
    goalInput.type = "number";
    goalInput.placeholder = "e.g., 85";
    goalInput.min = "0";
    goalInput.max = "100";
    goalInput.setAttribute("data-goal", code);
    goalRow.appendChild(goalLabel);
    goalRow.appendChild(goalInput);

    card.appendChild(assignmentsEl);
    card.appendChild(goalRow);

    if (savedInputs[code]) {
      restoreCourseInputs(card, savedInputs[code]);
    }

    const output = document.createElement("div");
    output.className = "course-output";
    output.setAttribute("data-course-output", code);
    if (savedOutputs[code]) {
      output.innerHTML = savedOutputs[code];
    } else {
      setCoursePlaceholder(code, output);
    }
    card.appendChild(output);

    const courseActions = document.createElement("div");
    courseActions.className = "course-actions";
    const computeBtn = document.createElement("button");
    computeBtn.type = "button";
    computeBtn.className = "primary";
    computeBtn.textContent = "Compute this course";
    computeBtn.addEventListener("click", (e) => {
      e.preventDefault();
      computeGrades();
    });
    const resetBtn = document.createElement("button");
    resetBtn.type = "button";
    resetBtn.className = "ghost";
    resetBtn.textContent = "Reset";
    resetBtn.addEventListener("click", (e) => {
      e.preventDefault();
      resetCourse(code);
    });
    courseActions.appendChild(computeBtn);
    courseActions.appendChild(resetBtn);

    card.appendChild(courseActions);
    coursesContainer.appendChild(card);
  });
}

function parseScore(raw) {
  const trimmed = raw.trim();
  if (!trimmed || trimmed.toLowerCase() === "none") {
    return null; // missing grade
  }

  if (trimmed.includes("/")) {
    const [numStr, denomStr] = trimmed.split("/", 2);
    const numerator = Number(numStr);
    const denominator = Number(denomStr);
    if (
      !Number.isFinite(numerator) ||
      !Number.isFinite(denominator) ||
      denominator <= 0 ||
      numerator < 0 ||
      numerator > denominator
    ) {
      return NaN;
    }
    return (numerator / denominator) * 100;
  }

  const value = Number(trimmed);
  if (!Number.isFinite(value) || value < 0 || value > 100) {
    return NaN;
  }
  return value;
}

function calculateCourse(code) {
  const course = COURSE_DATA[code];
  const card = document.querySelector(`[data-course-card="${code}"]`);
  const totalWeightAll = totalWeight(course);

  let weightedSum = 0;
  let totalWeightUsed = 0;
  let missingWeight = 0;
  let invalid = false;

  course.assignments.forEach((assignment) => {
    const input = card.querySelector(
      `input[data-course="${code}"][data-assignment="${assignment.name}"]`
    );
    if (!input) return;
    input.classList.remove("error");
    const parsed = parseScore(input.value);
    if (Number.isNaN(parsed)) {
      input.classList.add("error");
      invalid = true;
      return;
    }
    if (parsed === null) {
      missingWeight += assignment.weight;
      return;
    }
    weightedSum += (parsed / 100) * assignment.weight;
    totalWeightUsed += assignment.weight;
  });

  let goalInfo = null;
  const goalInput = card.querySelector(`input[data-goal="${code}"]`);
  if (goalInput) {
    goalInput.classList.remove("error");
    const rawGoal = goalInput.value.trim();
    if (rawGoal) {
      const goal = Number(rawGoal);
      if (!Number.isFinite(goal) || goal < 0 || goal > 100) {
        goalInput.classList.add("error");
        invalid = true;
      } else if (missingWeight > 0) {
        const requiredContribution = (goal / 100) * totalWeightAll - weightedSum;
        const neededAvg = (requiredContribution / missingWeight) * 100;
        goalInfo = { goal, neededAvg, remaining: missingWeight };
      } else {
        goalInfo = { goal, neededAvg: null, remaining: missingWeight };
      }
    }
  }

  const normalized =
    totalWeightUsed > 0 ? (weightedSum / totalWeightUsed) * 100 : 0;

  return {
    code,
    normalized,
    totalWeightAll,
    totalWeightUsed,
    missingWeight,
    invalid,
    goalInfo,
  };
}

function convertPercentToGPA(percent) {
  const match = GPA_SCALE.find((range) => percent >= range.min && percent <= range.max);
  return match || null;
}

function renderCourseResult(res) {
  const output = document.querySelector(
    `[data-course-output="${res.code}"]`
  );
  if (!output) return;

  output.innerHTML = "";

  if (res.invalid) {
    const warning = document.createElement("div");
    warning.className = "alert danger";
    warning.textContent =
      "Fix the highlighted inputs (0-100 or fraction like 18/20).";
    output.appendChild(warning);
    return;
  }

  if (res.totalWeightUsed === 0) {
    const placeholder = document.createElement("p");
    placeholder.className = "placeholder";
    placeholder.textContent = "Enter scores for this course to see the grade.";
    output.appendChild(placeholder);
    return;
  }

  const block = document.createElement("div");
  block.className = "result";

  const header = document.createElement("header");
  const title = document.createElement("div");
  title.className = "course-code";
  title.textContent = res.code;
  const grade = document.createElement("div");
  grade.className = "grade";
  grade.textContent = `${res.normalized.toFixed(2)}%`;
  header.appendChild(title);
  header.appendChild(grade);

  const meta = document.createElement("div");
  meta.className = "meta";
  meta.textContent = `Using ${res.totalWeightUsed.toFixed(
    1
  )}% of ${res.totalWeightAll}% weight; ${
    res.missingWeight
  }% still missing.`;

  block.appendChild(header);
  block.appendChild(meta);

  const gpaInfo = convertPercentToGPA(res.normalized);
  const gpaLine = document.createElement("div");
  gpaLine.className = "gpa-display";

  const gpaLabel = document.createElement("span");
  gpaLabel.className = "gpa-label";
  gpaLabel.textContent = "GPA";

  const gpaValue = document.createElement("span");
  gpaValue.className = "gpa-value";
  gpaValue.textContent = gpaInfo ? gpaInfo.gpa.toFixed(1) : "n/a";

  const gpaLetter = document.createElement("span");
  gpaLetter.className = "gpa-letter";
  gpaLetter.textContent = gpaInfo ? gpaInfo.letter : "";

  gpaLine.appendChild(gpaLabel);
  gpaLine.appendChild(gpaValue);
  if (gpaInfo) {
    gpaLine.appendChild(gpaLetter);
  }
  block.appendChild(gpaLine);

  if (res.goalInfo) {
    const goalNote = document.createElement("div");
    goalNote.className = "meta";
    if (res.goalInfo.remaining > 0) {
      const needed = res.goalInfo.neededAvg;
      if (needed <= 0) {
        goalNote.textContent = `You're already above the ${res.goalInfo.goal.toFixed(
          1
        )}% goal; any scores on the remaining ${res.goalInfo.remaining.toFixed(
          1
        )}% keep you on track.`;
      } else if (needed > 100) {
        goalNote.textContent = `To reach ${res.goalInfo.goal.toFixed(
          1
        )}%, you would need ${needed.toFixed(
          2
        )}% on the remaining ${res.goalInfo.remaining.toFixed(
          1
        )}% weight, ggs.`;
      } else {
        goalNote.textContent = `To reach ${res.goalInfo.goal.toFixed(
          1
        )}%, you need an average of ${needed.toFixed(
          2
        )}% across the remaining ${res.goalInfo.remaining.toFixed(
          1
        )}% weight.`;
      }
    } else {
      goalNote.textContent =
        "Goal provided, but there is no remaining weight to adjust.";
    }
    block.appendChild(goalNote);
  }

  output.appendChild(block);
}

function computeGrades() {
  if (!selectedCourses.size) {
    setSummaryPlaceholder();
    return;
  }

  summaryEl.innerHTML = "";
  selectedCourses.forEach((code) => {
    const res = calculateCourse(code);
    if (!res) return;
    renderCourseResult(res);
  });
}

function setSummaryPlaceholder() {
  summaryEl.innerHTML =
    '<p class="placeholder">Compute to see grades under each course.</p>';
}

function setCoursePlaceholder(code, elementOverride) {
  const target =
    elementOverride ||
    document.querySelector(`[data-course-output="${code}"]`);
  if (!target) return;
  target.innerHTML =
    '<p class="placeholder">Enter scores, then compute to see this course grade.</p>';
}

function resetCourse(code) {
  const card = document.querySelector(`[data-course-card="${code}"]`);
  if (!card) return;

  card
    .querySelectorAll(`input[data-course="${code}"], input[data-goal="${code}"]`)
    .forEach((input) => {
      input.value = "";
      input.classList.remove("error");
    });

  setCoursePlaceholder(code);
}

function captureCourseInputs() {
  const data = {};
  document
    .querySelectorAll("[data-course-card]")
    .forEach((card) => {
      const code = card.dataset.courseCard;
      const assignments = {};
      card
        .querySelectorAll(
          `input[data-course="${code}"][data-assignment]`
        )
        .forEach((input) => {
          assignments[input.dataset.assignment] = input.value;
        });
      const goalInput = card.querySelector(`input[data-goal="${code}"]`);
      data[code] = {
        assignments,
        goal: goalInput ? goalInput.value : "",
      };
    });
  return data;
}

function captureCourseOutputs() {
  const data = {};
  document.querySelectorAll("[data-course-output]").forEach((el) => {
    const code = el.dataset.courseOutput;
    data[code] = el.innerHTML;
  });
  return data;
}

function restoreCourseInputs(card, saved) {
  const code = card.dataset.courseCard;
  if (!saved) return;
  Object.entries(saved.assignments || {}).forEach(([assignment, value]) => {
    const input = card.querySelector(
      `input[data-course="${code}"][data-assignment="${assignment}"]`
    );
    if (input) input.value = value;
  });
  if (saved.goal !== undefined) {
    const goalInput = card.querySelector(`input[data-goal="${code}"]`);
    if (goalInput) goalInput.value = saved.goal;
  }
}

function selectAllCourses() {
  selectedCourses = new Set(COURSE_ORDER);
  renderCourseList();
  renderCourseSections();
  setSummaryPlaceholder();
}

function clearCourses() {
  selectedCourses = new Set();
  renderCourseList();
  renderCourseSections();
  setSummaryPlaceholder();
}

function init() {
  renderCourseList();
  renderCourseSections();
  setSummaryPlaceholder();

  document.getElementById("select-all").addEventListener("click", (e) => {
    e.preventDefault();
    selectAllCourses();
  });
  document.getElementById("clear-all").addEventListener("click", (e) => {
    e.preventDefault();
    clearCourses();
  });
}

init();
