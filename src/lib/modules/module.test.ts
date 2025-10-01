import { z } from "zod"
import Module from "./module"

describe("Module Class", async ()=>{
    it("Can be instantiated", async ()=>{
        const schema = z.object({
            name: z.string(),
            age: z.number(),
        })
        const testModule = new Module(schema, "testModule", true)
        expect(testModule).toBeDefined()
    })
})