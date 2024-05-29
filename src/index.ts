import { IParseFileRequest, IParseRequest, Parse } from "./types/index";
import fs from "fs";

class QuickCSV {
  constructor() {}

  #ParseLine(line: string, delimiter: string) {
    const lineData = line.split(delimiter);
    return lineData;
  }

  parse({ content, delimiter = "," }: IParseRequest): Promise<Parse> {
    return new Promise((resolve, reject) => {
      try {
        const lines = content.split(/\r?\n/);
        const headers = this.#ParseLine(lines[0]!, delimiter);

        const parsedContent = [];
        if (!!headers.length && lines.length > 1) {
          for (let i = 1; i < lines.length; i++) {
            const line = this.#ParseLine(lines[i]!, delimiter);
            const newRecord = headers.reduce(
              (object: any, header: string, index: number) => {
                object[header] = line[index];
                return object;
              },
              {}
            );
            parsedContent.push(newRecord);
          }
        }

        resolve({ data: parsedContent, count: parsedContent.length });
      } catch (error) {
        reject({ error });
      }
    });
  }

  parseCSV({ filePath }: IParseFileRequest): Promise<Parse> {
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, "utf8", (error, data) => {
        if (error) {
          reject(error);
        }
        this.parse({ content: data }).then((result) => {
          resolve(result);
        });
      });
    });
  }
}

const parser = new QuickCSV();

export default parser;

// parser.parse({
//   content: `id,name,email,dateOfBirth
// 1,"John Doe","johndoe@example.com","1985-06-15"
// 2,"Jane Smith","janesmith@example.com","1990-11-23"
// 3,"Bob Johnson","bobjohnson@example.com","1978-02-09"
// 4,"Emily Davis","emilydavis@example.com","1995-08-30"
// 5,"Michael Brown","michaelbrown@example.com","1982-12-05"`,
// });

// parser
//   .parseCSV({ filePath: "./src/files/example.csv" })
//   .then((data) => console.log(data));
