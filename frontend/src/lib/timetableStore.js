import fs from "fs";
import path from "path";

const filePath = path.resolve(process.cwd(), "src/data/timetables.json");

export function readTimetables() {
  try {
    const fileData = fs.readFileSync(filePath, "utf-8");
    console.log(JSON.parse(fileData));
    return JSON.parse(fileData);
  } catch (error) {
    return [];
  }
}

export function writeTimetables(timetables) {
  fs.writeFileSync(filePath, JSON.stringify(timetables, null, 2));
}