import { httpRouter } from "convex/server";
import { authComponent, createAuth } from "./auth/index";
import { registerProfileImageRoutes } from "./http/profile_image";
import { registerQuestionImageRoutes } from "./http/question_image";

const http = httpRouter();

authComponent.registerRoutes(http, createAuth);

registerProfileImageRoutes(http);
registerQuestionImageRoutes(http);

export default http;
