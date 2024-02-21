const OpenAI = require("openai");
const fs = require("fs");
const xml2js = require("xml2js");

function removeFirstAndLastLine(str) {
  let lines = str.split('\n'); // split the lines
  lines = lines.slice(1, -1); // remove the first and last line
  return lines.join('\n'); // join the remaining lines back into a single string
}

function addEntryToXmlFile(filePath, newEntry) {
  // Read the XML file
  fs.readFile(filePath, 'utf-8', (err, data) => {
    if (err) throw err;

    // Parse the XML data
    xml2js.parseString(data, (err, result) => {
      if (err) throw err;

      // Add the new entry to the Objects level
      result.Package.Objects[0].Object.push({ _: newEntry, $: { Type: 'File' } });

      // Convert the JavaScript object back to XML
      const builder = new xml2js.Builder();
      const xml = builder.buildObject(result);

      // Write the updated XML back to the file
      fs.writeFile(filePath, xml, (err) => {
        if (err) throw err;
        console.log('The XML file has been updated');
      });
    });
  });
}

async function generatemappViewContent(image, text) {
  let rawContent = await generatemappViewContentRaw(image, text);
  let contentName = "AIGeneratedContent" + new Date().valueOf() + ".content";
  let content = removeFirstAndLastLine(rawContent);
  storeContentIntoFile("C:/AsProjects/CoffeeMachine/Logical/mappView/Visualization/Pages/AreaContents/", contentName, content).then((response) => {
    console.log(response);
    addEntryToXmlFile('C:/AsProjects/CoffeeMachine/Logical/mappView/Visualization/Pages/AreaContents/Package.pkg', contentName);
  }).catch((error) => {
    console.error(error);
  });
};

async function generatemappViewContentRaw(imageBase64, prompt) {
  const openai = new OpenAI();

  let contentToUse;
  if (imageBase64 === "") {
    contentToUse = [
      {
        type: "text", text: prompt,
      }
    ];
  } else {
    contentToUse = [
      {
        type: "text", text: prompt,
      },
      {
        type: "image_url",
        image_url: {
          "url": imageBase64
        },
      },
    ];
  }

  const response = await openai.chat.completions.create({
    model: "gpt-4-vision-preview",
    max_tokens: 4096,
    messages: [
      {
        role: "system",
        content: `You are a front end designer. You help the developer generating design files that represent the actual screen. Those design files are following a specific XML format. As a detail, two widgets cannot have the same z-index. For the content id, select a random number.
        You are able to identify the basic components inside the provided image, get the inputs to adjust the design based on the text (if only text is provided you can create the basic design out of the description), and translate them to the XML format. Only the XML format should be part of the response, no notes or explanations. The file needs to run in the system, no extra characters or annotations are required.
        XML Sample with Button, Label, Line, NumericInput, RadioButtonGroup, and RadioButton widgets. Use only those types of widgets:
        
        <?xml version="1.0" encoding="utf-8"?>
        <Content id="content_1" height="600" width="800" xmlns="http://www.br-automation.com/iat2015/contentDefinition/v2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
          <Widgets>
            <Widget xsi:type="widgets.brease.Label" id="Label1" top="20" left="20" width="160" height="40" zIndex="0" text="Main Visualization" borderWidth="2px" backColor="rgba(0, 0, 0, 1)" borderStyle="solid" textColor="rgba(255, 255, 255, 1)" />
            <Widget xsi:type="widgets.brease.Line" id="Line1" zIndex="1" x1="0" x2="800" y1="80" y2="80" />
            <Widget xsi:type="widgets.brease.Line" id="Line2" zIndex="2" x1="180" x2="180" y1="80" y2="600" />
            <Widget xsi:type="widgets.brease.Button" id="Button1" top="140" left="40" width="120" height="42" zIndex="3" text="Home" backColor="rgba(255, 128, 0, 1)" textColor="rgba(255, 255, 192, 1)" />
            <Widget xsi:type="widgets.brease.NumericInput" id="NumericInput1" top="160" left="260" zIndex="4" value="10" />
            <Widget xsi:type="widgets.brease.RadioButtonGroup" id="RadioButtonGroup1" top="280" left="239" width="521" height="100" zIndex="5">
              <Widgets>
                <Widget xsi:type="widgets.brease.RadioButton" id="RadioButton1" top="40" left="21" zIndex="0" text="RadioButton1" />
                <Widget xsi:type="widgets.brease.RadioButton" id="RadioButton2" top="40" left="181" zIndex="1" text="RadioButton2" />
                <Widget xsi:type="widgets.brease.RadioButton" id="RadioButton3" top="40" left="341" zIndex="2" text="RadioButton3" />
              </Widgets>
            </Widget>
          </Widgets>
        </Content>`
      },
      {
        role: "user",
        content: contentToUse,
      },
    ],
  });
  return response.choices[0].message.content;
};

async function storeContentIntoFile(path, contentName, content) {
  return new Promise((resolve, reject) => {
    // Store the response in a text file
    let writeStream = fs.createWriteStream(path + contentName);
    writeStream.write(content, 'utf8');
    writeStream.end();
    writeStream.on('finish', () => {
      console.log("Response stored in ContentFile");
      resolve('Image processed successfully');
    }).on('error', (err) => {
      console.error("Error writing to file:", err);
      reject(err);
    });
  });
}



module.exports = generatemappViewContent;