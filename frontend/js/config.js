const CONFIG = {
    SERVER_URL: "http://localhost:3000"
};

const socket = io(CONFIG.SERVER_URL);

export { CONFIG, socket };
