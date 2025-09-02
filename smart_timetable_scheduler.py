
from datetime import time
import random


class TimetableScheduler:
    def __init__(self):
        self.time_slots = []   # ["09:30-10:20", ...] (kept in the order entered)
        self.subjects = {}     # {subject: {'weekly': int, 'allocated': int}}
        self.labs = {}         # {lab_name: {'duration': int, 'preferred_slot': str|None, 'allocated': bool}}
        self.classrooms = {}   # {room_name: {'available': bool}}
        self.timetable = {}    # {day: {slot: None|str}}
        self.conflicts = []

    # ------------------------ Input helpers ------------------------

    def get_time_slots(self):
        """Get regular time slots"""
        print("=== Enter Time Slots ===")
        print("Format: HH:MM-HH:MM (e.g., 09:00-10:00)")
        print("Type 'done' when finished")

        while True:
            slot = input("Enter time slot (or 'done'): ").strip()
            if slot.lower() == 'done':
                break
            try:
                start, end = slot.split('-')
                time.fromisoformat(start.strip())
                time.fromisoformat(end.strip())
                self.time_slots.append(slot)
                print(f"Added: {slot}")
            except ValueError:
                print("Invalid format. Use HH:MM-HH:MM")

    def get_subjects(self):
        """Get theory subjects and weekly class count"""
        print("\n=== Enter Theory Subjects ===")
        print("Format: SubjectName,WeeklyClasses (e.g., Math,4)")
        print("Type 'done' when finished")

        while True:
            entry = input("Enter subject and weekly classes (or 'done'): ").strip()
            if entry.lower() == 'done':
                break
            try:
                subject, count = entry.split(',')
                subject = subject.strip()
                count = int(count.strip())
                if count <= 0:
                    raise ValueError
                self.subjects[subject] = {'weekly': count, 'allocated': 0}
                print(f"Added: {subject} ({count} classes/week)")
            except ValueError:
                print("Invalid format. Use SubjectName,NumberOfClasses")

    def get_lab_classes(self):
        """Get lab classes with duration and optional preferred slot"""
        print("\n=== Enter Lab Classes ===")
        print("Format: LabName,Duration,[OptionalSlot] (e.g., OOPS Lab,2,13:00-14:00)")
        print("Type 'done' when finished")

        while True:
            entry = input("Enter lab details (or 'done'): ").strip()
            if entry.lower() == 'done':
                break
            try:
                parts = entry.split(',', 2)
                if len(parts) < 2:
                    raise ValueError
                lab_name = parts[0].strip()
                duration = int(parts[1].strip())
                if duration < 1 or duration > len(self.time_slots):
                    raise ValueError
                preferred_slot = None
                if len(parts) > 2 and parts[2].strip():
                    preferred_slot = parts[2].strip()

                self.labs[lab_name] = {
                    'duration': duration,
                    'preferred_slot': preferred_slot,
                    'allocated': False
                }
                print(f"Added: {lab_name} (Duration: {duration} periods)")
            except ValueError:
                print("Invalid format. Use: LabName,Duration,[OptionalSlot]")

    def get_classrooms(self):
        """Get classrooms (not yet used for conflicts, but stored)"""
        print("\n=== Enter Classrooms ===")
        print("Enter classroom names (e.g., Room 101)")
        print("Type 'done' when finished")

        while True:
            room = input("Enter classroom (or 'done'): ").strip()
            if room.lower() == 'done':
                break
            if room:
                self.classrooms[room] = {'available': True}
                print(f"Added: {room}")

    # ------------------------ Core scheduling ------------------------

    def initialize_timetable(self):
        """Initialize empty timetable"""
        days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
        self.timetable = {day: {slot: None for slot in self.time_slots} for day in days}

    def _count_on_day(self, day, subject):
        return sum(1 for s in self.time_slots if self.timetable[day][s] == subject)

    def _find_consecutive_free_slots(self, day, duration):
        """Return a block of 'duration' consecutive free slot names or None"""
        for i in range(len(self.time_slots) - duration + 1):
            block = [self.time_slots[i + j] for j in range(duration)]
            if all(self.timetable[day][slot] is None for slot in block):
                return block
        return None

    def schedule_labs(self):
        """Schedule each lab once per week. Honors preferred start slot across any day."""
        days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

        for lab_name, lab_data in self.labs.items():
            duration = lab_data['duration']
            preferred_slot = lab_data['preferred_slot']
            scheduled = False

            # Try preferred start slot across days
            if preferred_slot and preferred_slot in self.time_slots:
                start_idx = self.time_slots.index(preferred_slot)
                if start_idx + duration <= len(self.time_slots):
                    block_template = [self.time_slots[start_idx + i] for i in range(duration)]
                    day_order = days[:]
                    random.shuffle(day_order)
                    for day in day_order:
                        if all(self.timetable[day][slot] is None for slot in block_template):
                            for slot in block_template:
                                self.timetable[day][slot] = f"{lab_name} (Lab)"
                            lab_data['allocated'] = True
                            scheduled = True
                            break

            # Otherwise place anywhere with a free block
            if not scheduled:
                day_order = days[:]
                random.shuffle(day_order)
                for day in day_order:
                    block = self._find_consecutive_free_slots(day, duration)
                    if block:
                        for slot in block:
                            self.timetable[day][slot] = f"{lab_name} Lab"
                        lab_data['allocated'] = True
                        scheduled = True
                        break

            if not scheduled:
                self.conflicts.append(f"Could not schedule lab: {lab_name}")

    def schedule_theory_classes(self):
        """
        Schedule theory classes to match exact weekly counts.
        - Prefer adjacent pairs when 2 or more needed.
        - Max 2 classes per subject per day.
        - If impossible, record a conflict with the true final count.
        """
        days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

        # Prioritize high-demand subjects
        subject_order = sorted(self.subjects.keys(),
                               key=lambda x: self.subjects[x]['weekly'],
                               reverse=True)

        for subject in subject_order:
            target = self.subjects[subject]['weekly']

            # Keep trying until we hit the target or we get stuck
            safety = 0
            while self.subjects[subject]['allocated'] < target:
                safety += 1
                if safety > 500:  # hard stop
                    break

                need = target - self.subjects[subject]['allocated']
                placed = False

                # 1) Try to place an adjacent pair if we need at least 2
                if need >= 2:
                    day_order = days[:]
                    random.shuffle(day_order)
                    for day in day_order:
                        # Can place a pair only if we don't already have 2 that day
                        if self._count_on_day(day, subject) > 0:
                            # Placing a pair would make it 3+ on that day
                            continue
                        block = self._find_consecutive_free_slots(day, 2)
                        if block:
                            self.timetable[day][block[0]] = subject
                            self.timetable[day][block[1]] = subject
                            self.subjects[subject]['allocated'] += 2
                            placed = True
                            break

                # 2) Otherwise place a single class
                if not placed:
                    day_order = days[:]
                    random.shuffle(day_order)
                    for day in day_order:
                        if self._count_on_day(day, subject) >= 2:
                            continue
                        # find any single free slot
                        for slot in self.time_slots:
                            if self.timetable[day][slot] is None:
                                self.timetable[day][slot] = subject
                                self.subjects[subject]['allocated'] += 1
                                placed = True
                                break
                        if placed:
                            break

                # If we couldn't place anything this round, give up gracefully
                if not placed:
                    break

            # Final per-subject check
            allocated = self.subjects[subject]['allocated']
            if allocated < target:
                self.conflicts.append(f"{subject}: {allocated}/{target} classes scheduled")

    def generate_timetable(self):
        """Generate full timetable"""
        print("\n=== Generating Timetable ===")
        self.initialize_timetable()
        self.conflicts = []
        self.schedule_labs()
        self.schedule_theory_classes()

    # ------------------------ Output ------------------------

    def display_timetable(self):
        """Display timetable"""
        print("\n" + "=" * 80)
        print(" " * 30 + "GENERATED TIMETABLE")
        print("=" * 80)

        header = "{:<12}".format("Day")
        for slot in self.time_slots:
            header += "{:<15}".format(slot)
        print(header)
        print("-" * len(header))

        days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
        for day in days:
            row = "{:<12}".format(day)
            for slot in self.time_slots:
                subject = self.timetable[day][slot] or "--"
                row += "{:<15}".format(subject)
            print(row)

        print("=" * 80)

        if self.conflicts:
            print("\n⚠️  Conflicts/Warnings:")
            for conflict in self.conflicts:
                print(f"  - {conflict}")
        else:
            print("\n✅ Timetable generated successfully with no conflicts!")

    # ------------------------ Runner ------------------------

    def run(self):
        """Main execution"""
        print("🏫 SMART TIMETABLE SCHEDULER")
        print("=" * 40)

        self.get_time_slots()
        if not self.time_slots:
            print("No time slots entered. Exiting.")
            return

        self.get_subjects()
        if not self.subjects:
            print("No subjects entered. Exiting.")
            return

        self.get_lab_classes()
        self.get_classrooms()

        self.generate_timetable()
        self.display_timetable()


# Run
if __name__ == "__main__":
    scheduler = TimetableScheduler()
    scheduler.run()
