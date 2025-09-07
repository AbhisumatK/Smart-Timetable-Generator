Smart Timetable Generator (SIH25028)
Constraint-aware timetable generator for educational institutes. Built for Smart India Hackathon problem SIH25028, this project automates creation of clash-free schedules while honoring faculty availability, room capacities, course requirements, and institutional policies.

Note: Replace the placeholders in this README with your project-specific details. If you share your tech stack and run commands, I can tailor this to your repo.

Highlights
Automatic, clash-free timetable generation

Hard and soft constraints with configurable weights

Faculty availability, preferences, and load limits

Room capacities, types (lecture/lab), and equipment

Course sections, labs, combined lectures, and tutorials

Fairness: balanced distribution across days and times

Avoid undesired patterns (back-to-back, late slots, long gaps)

Export to CSV/Excel/JSON; print-friendly views

API-ready and/or CLI workflow (depending on your implementation)

Repeatable runs and deterministic seeds

Problem Context (SIH25028)
Objective: Generate optimal timetables for departments/campuses that satisfy institutional constraints and preferences.

Scope:

Multiple courses, sections, faculty, and rooms

Constraints include availability, room type/capacity, lab groupings, and no-overlaps

Optimization for fairness and preferences

Table of Contents
Features

Data Model (Inputs/Outputs)

Constraints

How It Works (Algorithms)

Project Structure

Quick Start

Configuration

Usage

Testing

Performance Tips

Roadmap

Contributing

License

Acknowledgements

Features
Data ingestion from CSV/JSON

Validates inputs and flags inconsistencies

Constraint engine with hard/soft separation

Multi-objective scoring with weights

Pluggable solvers (e.g., CP-SAT/OR, ILP, GA) – choose per build

Incremental fixes for minor edits

Multi-department generation and conflict checks

Export to files; optional REST API/UI if enabled in your build

Data Model
You can use CSV or JSON. Example CSVs:

teachers.csv

teacher_id, name, max_load_per_week, dept

courses.csv

course_id, name, credits, type (lecture/lab/tutorial), sections, group_size, preferred_teacher_id

sections.csv

section_id, course_id, student_count, program, semester

rooms.csv

room_id, name, capacity, type (lecture/lab), equipment (comma-separated)

timeslots.csv

slot_id, day, start_time, end_time

availability.csv

teacher_id, day, slot_id, available (1/0), preference (0-10)

pairs.csv (optional, for linked lectures/tutorials/labs)

parent_course_id, child_course_id, policy (consecutive/same_day/different_day)

Output (example JSON structure):

timetable_id

generated_at

assignments: list of

course_id, section_id, teacher_id, room_id, slot_id, day, start_time, end_time

score:

hard_violations: 0

soft_penalty: numeric

components: per-constraint penalty details

Constraints
Hard constraints (must never be violated):

No teacher overlaps

No room overlaps

Room capacity >= section size

Room type matches session type (lab/lecture)

Respect teacher absolute unavailability

Linked sessions policy if defined (e.g., lab must follow lecture in same week)

One session per section per slot

Soft constraints (penalized, weighted):

Teacher preferences for/against certain slots

Avoid back-to-back sessions beyond threshold

Spread course meetings across days

Avoid very early/very late slots

Balance teaching load through the week

Keep same course/section consistent in room or day where possible

Minimize idle gaps for teachers and sections

Respect “no class” institutional windows (e.g., lunch, events)

Weights are configurable; see Configuration.

How It Works
Typical solver approaches supported by timetable problems:

Constraint Programming (CP-SAT)

Integer Linear Programming (ILP/MIP)

Metaheuristics: Genetic Algorithms, Simulated Annealing, Tabu Search

Hybrid: CP for feasibility + Metaheuristics for soft optimization

High-level flow:

Load and validate inputs

Build variables: x[course, section, slot, room, teacher]

Add hard constraints (feasibility)

Add soft constraints to objective with weights

Optimize for minimum penalty (respecting hard feasibility)

Export assignments and score breakdown

Determinism:

Use a fixed seed to get repeatable results, if your solver supports it.

