"use strict";

import { fakerRU } from "@faker-js/faker";
import { transliterate } from "transliteration";   
import { promises as fs } from "fs";


const data = [];
(function generateData() {
    for (let i = 0; i < 1200; i++)
    {
        let fullName = fakerRU.person.fullName();
        let names = fullName.split(' ');
        let firstName = transliterate(names[0].toLowerCase());
        let lastName = transliterate(names[1].toLowerCase());

        let emails = [fakerRU.internet.email({firstName: firstName, lastName: lastName, provider: "mail.ru"})];
        let number_of_emails = fakerRU.number.int({min: 0, max: 2});
        for (let i = 0; i < number_of_emails; i++)
        {
            emails.push(fakerRU.internet.email());
        }

        let days_past_registration = fakerRU.number.int({min: 100, max: 2500});
        let days_past_last_auth = fakerRU.number.int({min: 1, max: 90});
        let days_past_birth = fakerRU.number.int({min: 5000, max: 20000});

        let publications = [];
        let number_of_pubs = fakerRU.number.int({min: 1, max: 3});
        for (let i = 0; i < number_of_pubs; i++) {
            let days_past_publication = fakerRU.number.int({min: 1, max: 100});

            let comments = [];
            let number_of_comments = fakerRU.number.int({min: 0, max: 3});
            for (let i = 0; i < number_of_comments; i++) {
                comments.push({
                    user_id: fakerRU.number.int({min: 1, max: 1200}),
                    comment_text: fakerRU.lorem.paragraph()
                })
            }

            publications.push({
                title: fakerRU.lorem.sentence(),
                description: fakerRU.lorem.paragraph(),
                pages: fakerRU.number.int({min: 1, max: 20}),
                category: fakerRU.lorem.word(),
                publication_data: fakerRU.date.recent({days: days_past_publication}).toLocaleDateString(),
                comments: comments
            })
        }

        data.push({
            user_id: i+1,
            full_name: fullName,
            email: emails,
            registration_date: fakerRU.date.recent({days: days_past_registration}).toLocaleDateString(),
            last_authorization_date: fakerRU.date.recent({days: days_past_last_auth}).toLocaleDateString(),
            status: fakerRU.helpers.arrayElement(["Подтвержден", "Не подтвержден"]),
            publications: publications,
            birth_date: fakerRU.date.recent({days: days_past_birth}).toLocaleDateString(),
            gender: fakerRU.helpers.arrayElement(["Мужской", "Женский"]),
        });
    }
})();

(async function exportJSON()
{
    try {
        await fs.writeFile("dummy_data.json", JSON.stringify(data), null, 4);
        console.log("JSON File successfully created!");
    }
    catch (error) {
        console.error(error);
    }
}());

let imported_data = {};
async function importJSON()
{
    try {
        return JSON.parse(await fs.readFile("dummy_data.json", "utf8"));
    }
    catch (error) {
        console.error(error);
    }
};
imported_data = await importJSON();

// Count number of publications for each user
(async function modifyData()
{
    try {
        for (let i = 0; i < imported_data.length; i++)
        {
            imported_data[i].publications_number = imported_data[i].publications.length;
        }
        console.log(imported_data);
    }
    catch (error) {
        console.error(error);
    }
}());

async function convertToDSV(imported_data, delimiter = '\t')
{
    try {
        let headers = Object.keys(imported_data[0]);
        // Go through each row
        let rows = imported_data.map(row => 
            headers.map(field => {
            let value = row[field];
            if (field === "publications") {
                // Put nested object into 1 value
                value = JSON.stringify(row["publications"]);
            }
            return value;
            }).join(delimiter)
        );
        // Inserting headers to the top
        rows.unshift(headers.join(delimiter));
        return rows.join('\n');
    }
    catch (error) {
        console.error(error);
    }
};

(async function exportToDSV() {
    try {
      const dsvData = await convertToDSV(imported_data);
      await fs.writeFile("modified_data.dsv", dsvData, "utf8");
      console.log("DSV File successfully created!");
    } catch (error) {
      console.error(error);
    }
}());

