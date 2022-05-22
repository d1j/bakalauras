import axios from "axios";

const HOST = `http://localhost:8000`;

class BaseService {
  constructor(path) {
    this.path = path;
    this.host = HOST;
    this.pageSize = 10;
  }

  async sendRequest(method, path = this.path, data = null) {
    try {
      let response = await axios.request({
        method,
        url: this.host + path,
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        ...(data && { data }),
      });
      return [true, response.data];
    } catch (err) {
      console.log(err);
      return [false, err.response.data];
    }
  }

  async getAll(page = 1, pageSize = this.pageSize) {
    let path = `${this.path}?limit=${pageSize}&offset=${pageSize * (page - 1)}`;
    return await this.sendRequest("GET", path);
  }
  async getById(id) {
    return await this.sendRequest("GET", `${this.path}${id}/`);
  }
  async create(data) {
    return await this.sendRequest("POST", this.path, data);
  }
  async update(data, id) {
    return await this.sendRequest("PUT", `${this.path}${id}/`, data);
  }
  async delete(id) {
    return await this.sendRequest("DELETE", `${this.path}${id}/`);
  }
}

class CommandService extends BaseService {
  async getAllScheduleCommands(scheduleId, page = 1, pageSize = this.pageSize) {
    let path = `${this.path}?schedule=${scheduleId}&limit=${pageSize}&offset=${pageSize * (page - 1)}`;
    return await this.sendRequest("GET", path);
  }
}

export const scheduleService = new BaseService("/core/scrape_schedule/");
export const commandService = new CommandService("/core/html_scrape_command/");
export const commandResultService = new BaseService("/core/html_scrape_command_result/");
export const API = axios.create({
  baseURL: HOST,
});
