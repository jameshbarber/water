const tempClient = {
    GET: (path: string) => {
        return fetch(`${path}`, {
            headers: {
                "Content-Type": "application/json"
            }
        })
    },
    POST: (path: string, data: any) => {
        return fetch(`${path}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        })
    }
}

export default tempClient