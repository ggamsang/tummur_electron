const { contextBridge, ipcRenderer } = require("electron");
const axios = require("axios");

contextBridge.exposeInMainWorld("electronAPI", {
  // murmur
  saveMurmur: (murmur) => {
    console.log("📤 Electron → 백엔드 저장 요청:", murmur); // 디버깅 로그
    return axios.post("http://localhost:8877/api/murmur", { murmur });
  },
  getMurmur: () => {
    console.log("📥 Electron → 백엔드 목록 요청");
    return axios.get("http://localhost:8877/api/murmur");
  },
  deleteMurmur: (id) => {
    console.log("📥 Electron → 백엔드 삭제 요청:", id);
    return axios.delete(`http://localhost:8877/api/murmur/${id}`);
  },

  // todos
  addTodo: (todo) => {
    console.log("📤 Electron → 백엔드 저장 요청:", todo); // 디버깅 로그
    return axios.post("http://localhost:8877/api/todos", { todo });
  },
  getTodos: () => {
    console.log("📥 Electron → 백엔드 목록 요청");
    return axios.get("http://localhost:8877/api/todos");
  },
  deleteTodo: (id) => {
    console.log("📥 Electron → 백엔드 삭제 요청:", id);
    return axios.delete(`http://localhost:8877/api/todos/${id}`);
  },
  patchTodo: (id, todo) => {
    console.log("📤 Electron → 백엔드 수정 요청:", id, todo); // 디버깅 로그
    return axios.patch(`http://localhost:8877/api/todos/${id}`, { todo });
  },
  hideWindow: () => ipcRenderer.send("hide-window"),
});
