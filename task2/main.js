import Ajv from "ajv";
import addFormats from "ajv-formats";

const ajv = new Ajv();
addFormats(ajv);

import schema from "./schema.json" assert { type: "json" };;

import correct_data from "./correct_data.json" assert { type: "json" };;
import incorrect_data from "./incorrect_data.json" assert { type: "json" };;

const validate = ajv.compile(schema);

function check_json(data, filename) {
    const valid = validate(data);
    if (valid) {
        console.log(filename, "is valid!");
    } else {
        console.log(filename, "is invalid:", validate.errors);
    }
}

for (let i = 0; i < correct_data.length; i++) {
    check_json(correct_data[i], "correct_data.json");
}

for (let i = 0; i < correct_data.length; i++) {
    check_json(incorrect_data[i], "incorrect_data.json");
}