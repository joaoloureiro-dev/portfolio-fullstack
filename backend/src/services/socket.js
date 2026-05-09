const clients = new Set();

export function addClient(client) {
    clients.add(client);
}

export function removeClient(client) {
    clients.delete(client);
}

export function broadcast(data) {
    const message = JSON.stringify(data);

    for (const client of clients) {
        if (client.readyState === 1) {
            client.send(message);
        }
    }
}