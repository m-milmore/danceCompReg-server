// used in error.js...
// when a duplication of a unique field is attempted,
// format the json object error message shown to the user,
// from { "studio" : "My Studio"}
// to { studio: "My Studio"}
// JSON.parse(err.keyValue) doesn't work
// I get an error message:
// SyntaxError: Unexpected token o in JSON at position 1
//     at JSON.parse (<anonymous>)
//     at errorHandler (C:\entry_form_server\dancecompreg-api\middleware\error.js:15:22)...

const formatErrorKeyValueJSON = (obj) => {
  let dup = JSON.stringify(obj).replace(/\"/g, " ");
  dup = dup.replace(" :", ":");
  dup = dup.replace(": ", ": '");
  return dup.replace(" }", "' }");
};

module.exports = formatErrorKeyValueJSON;
