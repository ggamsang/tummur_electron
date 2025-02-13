const { contextBridge } = require("electron");
const axios = require("axios");

contextBridge.exposeInMainWorld("electronAPI", {
    saveTask: (task) => {
        console.log("📤 Electron → 백엔드 저장 요청:", task); // 디버깅 로그
        return axios.post("http://localhost:8877/tasks", { task });
    },
    getTasks: () => {
        console.log("📥 Electron → 백엔드 목록 요청");
        return axios.get("http://localhost:8877/tasks");
    }
});
