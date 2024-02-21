import fs from "fs";
import xml2js from "xml2js";

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

async function main() {

let contentName = "AIGeneratedContent" + new Date().valueOf() + ".content";

  let content = `xml
<?xml version="1.0" encoding="utf-8"?>
<Content id="content_100" height="600" width="800" xmlns="http://www.br-automation.com/iat2015/contentDefinition/v2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <Widgets>
    <Widget xsi:type="widgets.brease.Label" id="Label1" top="10" left="10" width="300" height="40" zIndex="0" text="MAIN VISUALIZATION" borderWidth="2px" backColor="rgba(0,0,0,0)" borderStyle="solid" textColor="rgba(0,0,0,1)" />
  </Widgets>
</Content>
kaka`

  content = removeFirstAndLastLine(content);

  // Usage
  addEntryToXmlFile('C:/AsProjects/CoffeeMachine/Logical/mappView/Visualization/Pages/AreaContents/Package.pkg', contentName);

  // Store the response in a text file
  fs.writeFile("C:/AsProjects/CoffeeMachine/Logical/mappView/Visualization/Pages/AreaContents/" + contentName, content, { flag: 'a+' }, (err) => {
    if (err) {
      console.error("Error writing to file:", err);
    } else {
      console.log("Response stored in response.txt");
    }
  });

}
main();