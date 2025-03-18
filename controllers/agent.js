const agent = require("../models/agent");
const { user } = require("../models/user")

async function handleGetAllAvailableAgents(req, res) {
    try {
        const agents = await agent.find({}).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: agents });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

async function handleGetAllAgents(req, res) {
    try {
        if (req.data.role === "AGENCY" || "MANAGER" || "OFFICE-BOY") {
            const foundUser = await user.findById(req.data._id).populate({
                path: "agent",
                options: { sort: { createdAt: -1 } }
            })

            // if (!foundUser.agent) {
            //     return res.status(400).json({
            //         success: false,
            //         message: "Could find agent"
            //     })
            // }
            return res.status(200).json({
                success: true,
                data: foundUser.agent || {}
            })
        }
        else {
            const foundAgents = await agent.find({}).sort({ createdAt: -1 })

            if (!foundAgents) {
                return res.status(400).json({
                    success: false,
                    message: "Could find agents"
                })
            }
            return res.status(200).json({
                success: true,
                data: foundAgents
            })
        }
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

async function handleCreateAgent(req, res) {
    try {
        if (req.files) {
            for (const key of Object.keys(req.files)) {
                if (req.files[key][0] && req.files[key][0].location) {
                    req.body[key] = req.files[key][0].location; // Add the URL to req.body
                }
            }
        }

        const { name, city, state, ticketsAvailable, otherServices, caption, mobileNumbers, officeAddress, coverPhotos, profilePhoto } = req.body
        // console.log({
        //     name, city, state, ticketsAvailable, otherServices, caption, mobileNumbers, officeAddress, coverPhotos, profilePhoto
        // });

        if (!name || !city || !state || !ticketsAvailable || !otherServices || !caption || !mobileNumbers || !officeAddress || !coverPhotos || !profilePhoto) {
            return res.status(400).json({
                success: false,
                message: "Fill the required fields"
            })
        }

        const createdAgent = await agent.create({
            name, city, state, ticketsAvailable, otherServices, caption, mobileNumbers, officeAddress, coverPhotos, profilePhoto
        })

        // console.log({ token: req.data._id });

        const foundUser = await user.findById(req.data._id)
        foundUser.agent = createdAgent._id
        console.log({founduser: foundUser.agent});
        
        await foundUser.save()

        res.status(201).json({
            success: false,
            data: createdAgent
        })

    } catch (error) {
        res.status(500).json({ success: false, message: error.message || "Internal server error" });
    }
}

async function handleUpdateAgent(req, res) {
    try {
        if (req.files) {
            for (const key of Object.keys(req.files)) {
                if (req.files[key][0] && req.files[key][0].location) {
                    req.body[key] = req.files[key][0].location; // Add the URL to req.body
                }
            }
        }

        const { agentId } = req.query

        if (!agentId) {
            return res.status(400).json({
                success: false,
                message: "Provide the ID of agent to update"
            })
        }
        if (!req.body) {
            return res.status(400).json({
                success: false,
                message: "Provide the updated agent"
            })
        }
        const updatedAgent = await agent.findByIdAndUpdate(agentId, req.body)
        return res.status(200).json({
            success: true,
            data: updatedAgent
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

async function handleDeleteAgent(req, res) {
    try {
        const { agentId } = req.query
        if (!agentId) {
            return res.status(400).json({
                success: false,
                message: "Provide the ID of agent to delete"
            })
        }
        const foundUser = await agent.findById(agentId)
        if (!foundUser) {
            return res.status(400).json({
                success: false,
                message: "Provide a valid agent ID"
            })
        }
        await agent.findByIdAndDelete(agentId)

        foundUser.agent = null
        return res.status(200).json({
            success: true,
            message: "Agent Deleted"
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}


module.exports = {
    handleCreateAgent,
    handleGetAllAgents,
    handleDeleteAgent,
    handleUpdateAgent,
    handleGetAllAvailableAgents
}