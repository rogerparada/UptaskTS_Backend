import type { Request, Response } from "express";
import User from "../models/User";
import Project from "../models/Project";

export class TeamMemberController {
	static findMemberByEmail = async (req: Request, res: Response) => {
		try {
			const { email } = req.body;
			const user = await User.findOne({ email }).select("id name email");
			if (!user) {
				const error = new Error("User not found");
				return res.status(404).json({ error: error.message });
			}
			res.json(user);
		} catch (error) {
			res.status(500).json({ error: "Server Error" });
		}
	};
	static addMemberById = async (req: Request, res: Response) => {
		try {
			const { id } = req.body;
			const user = await User.findById(id).select("id");
			if (!user) {
				const error = new Error("User not found");
				return res.status(404).json({ error: error.message });
			}
			if (req.project.team.some((team) => team.toString() === user.id.toString())) {
				const error = new Error("The User was already a collaborator");
				return res.status(409).json({ error: error.message });
			}
			req.project.team.push(id);
			await req.project.save();

			res.send("The user has been added to the project as a collaborator");
		} catch (error) {
			res.status(500).json({ error: "Server Error" });
		}
	};
	static getProjectTeam = async (req: Request, res: Response) => {
		try {
			const project = await Project.findById(req.params.projectId).populate({ path: "team", select: "id name email" });
			res.json(project.team);
		} catch (error) {
			console.log(error);
			res.status(500).json({ error: "Server Error" });
		}
	};
	static removeMemberById = async (req: Request, res: Response) => {
		try {
			const { userId } = req.params;
			if (!req.project.team.some((team) => team.toString() === userId)) {
				const error = new Error("The User is not a collaborator");
				return res.status(409).json({ error: error.message });
			}

			req.project.team = req.project.team.filter((team) => team.toString() !== userId);
			await req.project.save();
			res.send("The user has been removed as a collaborator");
		} catch (error) {
			res.status(500).json({ error: "Server Error" });
		}
	};
}
