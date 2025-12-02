"""Interactive grade calculator that uses assignment weightings from weightings.py."""

from typing import Optional

import weightings


def get_courses() -> list[str]:
    """Return a sorted list of course codes from weightings.py."""
    if hasattr(weightings, "courses"):
        courses = weightings.courses
    elif hasattr(weightings, "couses"):  # fallback for existing misspelling
        courses = weightings.couses
    else:
        return []
    # Normalize to a list and sort for stable order.
    return sorted(courses)


def get_assignments(course: str) -> dict[str, float]:
    """Return the weighting map for the given course code."""
    return getattr(weightings, f"{course}_assignments", {})


def select_courses(courses: list[str]) -> list[str]:
    """Prompt the user to choose which courses to evaluate."""
    print("Available courses:")
    for idx, course in enumerate(courses, start=1):
        print(f"  {idx}. {course}")

    prompt = (
        "\nEnter course numbers separated by commas to evaluate (e.g., 1,3,5), "
        "or 'all' to evaluate every course: "
    )
    while True:
        choice = input(prompt).strip().lower()
        if choice == "all":
            return courses

        selections = [c.strip() for c in choice.split(",") if c.strip()]
        picked: list[str] = []
        try:
            for sel in selections:
                idx = int(sel)
                if idx < 1 or idx > len(courses):
                    raise ValueError
                picked.append(courses[idx - 1])
        except ValueError:
            print("Please enter valid numbers from the list or 'all'.")
            continue

        if picked:
            # Deduplicate while preserving order
            seen = set()
            unique = []
            for course in picked:
                if course not in seen:
                    unique.append(course)
                    seen.add(course)
            return unique

        print("No selection made. Try again.")


def prompt_for_score(assignment: str, weight: float) -> Optional[float]:
    """Prompt until the user provides a score or 'none' for missing grades.

    Accepted formats:
    - Fraction: 18/20 (numerator/denominator)
    - Percentage: 87.5  (interpreted as 87.5%)
    - Missing: none
    """
    while True:
        raw = input(
            f"Grade for '{assignment}' (weight {weight}%): "
        ).strip()

        if raw.lower() == "none":
            return None

        if "/" in raw:
            try:
                num_str, denom_str = raw.split("/", maxsplit=1)
                numerator = float(num_str)
                denominator = float(denom_str)
            except ValueError:
                print("Please enter a valid fraction like 18/20.")
                continue
            if denominator <= 0:
                print("Denominator must be greater than 0.")
                continue
            if numerator < 0 or numerator > denominator:
                print("Numerator must be between 0 and the denominator.")
                continue
            percent = (numerator / denominator) * 100
            return percent

        try:
            value = float(raw)
        except ValueError:
            print("Please enter a valid fraction (e.g., 18/20), percentage (e.g., 87.5), or 'none'.")
            continue

        if 0 <= value <= 100:
            return value
        print("Percentage must be between 0 and 100, or enter 'none'.")


def compute_course_grade(course: str) -> float:
    """Prompt for all assignments and return the weighted grade."""
    assignments = get_assignments(course)
    if not assignments:
        print(f"No assignments found for {course}, skipping.")
        return 0.0

    print(f"\n--- {course} ---")
    total_weight_all = sum(assignments.values())
    total_weight_used = 0.0
    weighted_sum = 0.0
    missing_detected = False

    for assignment, weight in assignments.items():
        score = prompt_for_score(assignment, weight)
        if score is None:
            print(f"Skipping '{assignment}' (no grade yet).")
            missing_detected = True
            continue
        weighted_sum += (score / 100) * weight
        total_weight_used += weight

    if total_weight_used == 0:
        print(f"No completed weights for {course}.")
        return 0.0

    # If weights do not sum to 100, scale to a percentage for clarity.
    normalized_grade = (weighted_sum / total_weight_used) * 100
    print(f"Weighted grade for {course}: {normalized_grade:.2f}%")

    remaining_weight = total_weight_all - total_weight_used
    if missing_detected and remaining_weight > 0:
        choice = input(
            "Calculate needed average on remaining assessments to hit a goal final grade? (y/n): "
        ).strip().lower()
        if choice in {"y", "yes"}:
            while True:
                goal_raw = input("Enter desired final course grade percentage (e.g., 85): ").strip()
                try:
                    goal = float(goal_raw)
                except ValueError:
                    print("Please enter a numeric goal (e.g., 85).")
                    continue
                break

            required_contribution = (goal / 100) * total_weight_all - weighted_sum
            needed_avg = (required_contribution / remaining_weight) * 100
            print(
                f"To reach {goal:.2f}% overall, you need an average of {needed_avg:.2f}% "
                f"across the remaining {remaining_weight:.2f}% weight."
            )

    return normalized_grade


def main() -> None:
    print("=== Weighted Grade Calculator ===")
    courses = get_courses()
    if not courses:
        print("No courses found in weightings.py.")
        return
    courses = select_courses(courses)

    results: dict[str, float] = {}
    for course in courses:
        results[course] = compute_course_grade(course)

    print("\n=== Summary ===")
    for course, grade in results.items():
        print(f"{course}: {grade:.2f}%")


if __name__ == "__main__":
    main()
