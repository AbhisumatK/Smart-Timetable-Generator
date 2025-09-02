export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const {
    classrooms,
    timeSlots,
    subjects,
    facultyAvailability,
    specialClasses,
  } = req.body;

  // Replace with your actual API key in environment variable
  const apiKey = "AIzaSyByUEpsPDNXnX9EgJAfSa5QJ0zLMPS_RLA";
  if (!apiKey) {
    return res.status(500).json({ error: 'Missing Gemini API key' });
  }

  const model = 'gemma-3-12b-it';
  const api = 'streamGenerateContent';

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:${api}?key=${apiKey}`;

  // Construct prompt text replacing INSERT_INPUT_HERE
  const promptText = `
    You are an expert timetable scheduler AI.

    Given these inputs:

    Classrooms: ${classrooms.join(', ')}
    Time Slots: ${timeSlots.join(', ')}
    Subjects with weekly classes: ${Object.entries(subjects)
        .map(([s, c]) => s + ': ' + c)
        .join('; ')}

    Faculty availability: ${JSON.stringify(facultyAvailability)}
    Special fixed classes: ${JSON.stringify(specialClasses)}

    Generate 3 fully optimized timetable options as JSON with no extra text.

    Each option should be:
    {
    "option": "Option 1",
    "schedule": [
        {
        "day": "Monday",
        "time": "09:00-10:00",
        "classroom": "Room 101",
        "subject": "Math",
        "faculty": "Prof. John"
        },
        ...
    ]
    }
    Return exactly 3 options in a JSON array.
  `.trim();

  const payload = {
    contents: [
      {
        role: 'user',
        parts: [{ text: promptText }],
      },
    ],
    generationConfig: {
      thinkingConfig: {
        thinkingBudget: -1,
      },
    },
    tools: [
      {
        googleSearch: {},
      },
    ],
  };

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  };

  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`Gemini API returned HTTP ${response.status}: ${errBody}`);
    }

    // The response is a streaming JSON array (according to docs)
    // so parse as text then JSON parse chunks
    const text = await response.text();
    const chunks = JSON.parse(text);

    // Accumulate returned text parts
    let combinedText = '';

    for (const chunk of chunks) {
      if (
        chunk.candidates &&
        chunk.candidates[0] &&
        chunk.candidates[0].content &&
        chunk.candidates[0].content.parts &&
        chunk.candidates[0].content.parts[0] &&
        chunk.candidates[0].content.parts[0].text
      ) {
        combinedText += chunk.candidates[0].content.parts[0].text;
      }
    }

    // Parse combined JSON response for timetable options
    let timetableOptions = [];
    try {
      timetableOptions = JSON.parse(combinedText);
    } catch (parseErr) {
      return res.status(500).json({
        error: 'Failed to parse Gemini API JSON response',
        rawResponse: combinedText,
      });
    }

    return res.status(200).json({ timetableOptions });
  } catch (error) {
    console.error('Gemini API error:', error);
    return res.status(500).json({ error: error.message });
  }
}