import {
  ICreateCSVFile,
  IFormatToCSV,
  IParseFileRequest,
  IParseRequest,
  Parse,
} from "./types/index";
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

  parseCsvFile({ filePath }: IParseFileRequest): Promise<Parse> {
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

  formatToCsvString({ data }: IFormatToCSV): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        if (!data.length) {
          reject({ error: "provide an array of items" });
        }
        const keys = Object.keys(data[0]);

        const rows: string[] = [];
        rows.push(keys.join(","));

        data.forEach((row) => {
          const values = keys.map((key) => {
            let value = row[key];
            if (
              typeof value === "string" &&
              (value.includes(",") ||
                value.includes("\n") ||
                value.includes('"'))
            ) {
              value = `"${value.replace(/[",\n]/g, "")}"`;
            }
            return value;
          });
          rows.push(values.join(","));
        });
        resolve({ data: rows.join(`\n`) });
      } catch (error) {
        reject({ error });
      }
    });
  }

  createCsvFile({ filePath, data }: ICreateCSVFile) {
    return new Promise((resolve, reject) => {
      this.formatToCsvString({ data }).then((data) => {
        fs.writeFile(filePath, data.data, (error) => {
          if (error) {
            reject(error);
          }
          resolve("success");
        });
      });
    });
  }
}

const parser: QuickCSV = new QuickCSV();

export default parser;
