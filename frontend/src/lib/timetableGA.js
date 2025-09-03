// Utilities
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// Core GA timetable generator
export class TimetableGA {
  constructor({ classrooms, timeSlots, subjects, facultyAvailability, fixedClasses = [], populationSize = 50, generations = 100 }) {
    this.classrooms = classrooms;
    this.timeSlots = timeSlots;
    this.subjects = subjects; // [{name, weekly}]
    this.facultyAvailability = facultyAvailability; // { subject: [faculty] }
    this.fixedClasses = fixedClasses; // [{day, time, room, subject, faculty}]
    this.populationSize = populationSize;
    this.generations = generations;
  }

  // Initialize population with random valid timetables
  initializePopulation() {
    const population = [];
    for (let i = 0; i < this.populationSize; i++) {
      population.push(this.createRandomTimetable());
    }
    return population;
  }

  createRandomTimetable() {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    // Structure: timetable[day][time][room] = {subject, faculty}
    const timetable = {};
    days.forEach(day => {
      timetable[day] = {};
      this.timeSlots.forEach(time => {
        timetable[day][time] = {};
        this.classrooms.forEach(room => {
          timetable[day][time][room] = null; // empty initially
        });
      });
    });

    // Place fixed classes first
    this.fixedClasses.forEach(fc => {
      timetable[fc.day][fc.time][fc.room] = { subject: fc.subject, faculty: fc.faculty };
    });

    // Place subjects based on weekly class requirements randomly
    this.subjects.forEach(({ name, weekly }) => {
      let classesPlaced = 0;
      while (classesPlaced < weekly) {
        const day = days[Math.floor(Math.random() * days.length)];
        const time = this.timeSlots[Math.floor(Math.random() * this.timeSlots.length)];
        const room = this.classrooms[Math.floor(Math.random() * this.classrooms.length)];
        if (timetable[day][time][room] === null) {
          // Select faculty who teach this subject randomly from availability
          const faculties = this.facultyAvailability[name] || [];
          if (faculties.length === 0) return; // no faculty, skip
          const faculty = faculties[Math.floor(Math.random() * faculties.length)];

          timetable[day][time][room] = { subject: name, faculty };
          classesPlaced++;
        }
      }
    });
    return timetable;
  }

  // Fitness function: higher is better
  fitness(timetable) {
    let score = 1000;
    const facultyLoads = {};
    const subjectCounts = {};
    const roomUsage = {};

    const days = Object.keys(timetable);
    days.forEach(day => {
      const times = Object.keys(timetable[day]);
      times.forEach(time => {
        const rooms = Object.keys(timetable[day][time]);
        rooms.forEach(room => {
          const cls = timetable[day][time][room];
          if (cls) {
            // Count per faculty
            facultyLoads[cls.faculty] = (facultyLoads[cls.faculty] || 0) + 1;
            // Count per subject
            subjectCounts[cls.subject] = (subjectCounts[cls.subject] || 0) + 1;
            // Room usage
            roomUsage[room] = (roomUsage[room] || 0) + 1;
          }
        });
      });
    });

    // Penalize faculty conflicts: same faculty teaching two places same day & time
    days.forEach(day => {
      const times = Object.keys(timetable[day]);
      times.forEach(time => {
        const facultiesAtTime = new Set();
        const rooms = Object.keys(timetable[day][time]);
        rooms.forEach(room => {
          const cls = timetable[day][time][room];
          if (cls) {
            if (facultiesAtTime.has(cls.faculty)) {
              score -= 50; // clash penalty
            } else {
              facultiesAtTime.add(cls.faculty);
            }
          }
        });
      });
    });

    // Penalize subject under/over scheduling
    this.subjects.forEach(({ name, weekly }) => {
      const count = subjectCounts[name] || 0;
      const diff = Math.abs(weekly - count);
      score -= diff * 20;
    });

    // Reward balanced faculty workload
    const loads = Object.values(facultyLoads);
    const avgLoad = loads.reduce((a,b) => a+b,0) / (loads.length || 1);
    const loadVariance = loads.reduce((a,b) => a + (b - avgLoad) ** 2, 0) / (loads.length || 1);
    score -= loadVariance * 10;

    return score;
  }

  // Selection by roulette wheel method
  select(population, fitnesses) {
    const sumFit = fitnesses.reduce((a,b) => a+b,0);
    const pick = Math.random() * sumFit;
    let current = 0;
    for (let i = 0; i < population.length; i++) {
      current += fitnesses[i];
      if (current > pick) return population[i];
    }
    return population[population.length-1];
  }

  // Crossover (swap random day schedules)
  crossover(parent1, parent2) {
    const child = deepClone(parent1);
    const days = Object.keys(child);
    // Choose random day index to swap timetable with parent2
    const dayToSwap = days[Math.floor(Math.random() * days.length)];
    child[dayToSwap] = deepClone(parent2[dayToSwap]);
    return child;
  }

  // Mutation: swap subjects randomly in some slots
  mutate(timetable, mutationRate=0.05) {
    const child = deepClone(timetable);
    const days = Object.keys(child);
    days.forEach(day => {
      const times = Object.keys(child[day]);
      times.forEach(time => {
        child[day][time] = child[day][time] || {};
        const rooms = Object.keys(child[day][time]);
        rooms.forEach(room => {
          if (Math.random() < mutationRate) {
            // Randomly reassign subject/faculty or empty
            const subjectsArr = this.subjects.map(s => s.name);
            const subj = Math.random() < 0.3 ? null : subjectsArr[Math.floor(Math.random() * subjectsArr.length)];
            if (subj !== null) {
              // Pick faculty who can teach subject
              const faculties = this.facultyAvailability[subj] || [];
              const faculty = faculties.length > 0 ? faculties[Math.floor(Math.random() * faculties.length)] : null;
              if (faculty) {
                child[day][time][room] = { subject: subj, faculty };
              }
            } else {
              child[day][time][room] = null;
            }
          }
        });
      });
    });
    return child;
  }

  // Run GA to generate multiple options with recommendations
  run() {
    let population = this.initializePopulation();
    const generations = this.generations;

    for (let gen = 0; gen < generations; gen++) {
      const fitnesses = population.map(t => this.fitness(t));
      const newPopulation = [];

      // Elitism: carry forward top 2
      const sortedPop = population
        .map((t, i) => ({ t, f: fitnesses[i] }))
        .sort((a, b) => b.f - a.f);
      newPopulation.push(sortedPop[0].t, sortedPop[1].t);

      while (newPopulation.length < this.populationSize) {
        const parent1 = this.select(population, fitnesses);
        const parent2 = this.select(population, fitnesses);
        let child = this.crossover(parent1, parent2);
        child = this.mutate(child);
        newPopulation.push(child);
      }
      population = newPopulation;
    }

    // Evaluate top 3 timetables with recommendations
    const scored = population
      .map(t => ({ timetable: t, score: this.fitness(t) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    // Generate textual recommendations for each timetable based on scores
    return scored.map(({ timetable, score }, idx) => {
      let recommendation = "";
      if (score > 900) recommendation = "Highly optimized with minimal clashes and balanced workload.";
      else if (score > 800) recommendation = "Good optimization; slight imbalance or minor conflicts.";
      else recommendation = "Meets basic requirements but may need manual tuning.";

      return {
        option: `Option ${idx + 1}`,
        recommendation,
        schedule: timetable,
        fitnessScore: score.toFixed(2),
      };
    });
  }
}