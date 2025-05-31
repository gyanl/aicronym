require("dotenv").config();
const express = require('express');
const bodyParser = require('body-parser');
const { Configuration, OpenAIApi } = require("openai");
const path = require('path');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.use(express.static('public'));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/acronyms/:prompt', async (req, res) => {
  const prompt = req.params.prompt;
  try {
    const response = await openai.createCompletion({
      model: "gpt-3.5-turbo-instruct",
      prompt: `Generate 10 different creative acronym expansions for "${prompt}". Each expansion should be a complete sentence starting with the letter from the acronym. Format each as HTML. Return as a JSON array of strings.`,
      temperature: 0.7,
      max_tokens: 256,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    // Parse the response text into an array of strings
    const responseText = response.data.choices[0].text.trim();
    const expansions = responseText.split('\n').filter(line => line.trim().length > 0);
    
    res.json(expansions);
  } catch (error) {
    console.error('OpenAI API Error:', error);
    res.status(500).json({
      error: 'An error occurred while processing your request',
      details: error.message
    });
  }
});

// app.get('/quickstart/:prompt', async (req, res) => {
//   const prompt = req.params.prompt;
//   try {
//     const response = await openai.createCompletion({
//       model: "text-davinci-003",
//       prompt: `Generate a title and 4 creative lines with the prompt ${prompt}. Format result as HTML.`,
//       temperature: 0.7,
//       max_tokens: 256,
//       top_p: 1,
//       frequency_penalty: 0,
//       presence_penalty: 0,
//     });

//     const qsresult = response.data.choices[0].text;
//     res.json(qsresult);
//   } catch (error) {
//     console.error(error);
//     res.status(500).send('An error occurred while processing your request.');
//   }
// });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

