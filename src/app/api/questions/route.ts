import { NextResponse } from "next/server";
import { quizCreationSchema } from "@/schemas/forms/quiz";
import { ZodError } from "zod";
import { strict_output } from "@/lib/gpt";
import { getAuthSession } from "@/lib/nextauth";

export const POST = async (req: Request, res: Response) => {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return NextResponse.json(
        {
          error: "You must be logged in to create a quiz.",
        },
        {
          status: 401,
        }
      );
    }
    const body = await req.json();
    const { amount, topic, type } = quizCreationSchema.parse(body);
    let questions: any;
    if (type === "open_ended") {
      questions = await strict_output(
        "You are an helpful AI that is able ot generate a set of questions and answers. The length of the answers must not exceed 15 words. Store all the sets of questions and answers in a JSON array.",
        new Array(amount).fill(
          `You are to generate a random hard open-ended questions about "${topic}"`
        ),
        {
          question: "question",
          answer: "answer with max length of 15 words",
        }
      );
    } else if (type === "mcq") {
      questions = await strict_output(
        "You are an helpful AI that is able ot generate a set of questions and answers. The length of the answers must not exceed 15 words. Store all the sets of questions and answers in a JSON array.",
        new Array(amount).fill(
          `You are to generate a random random mcq questions about "${topic}"`
        ),
        {
          question: "question",
          answer: "answer with max length of 15 words",
          option1: "1st option with max length of 15 words",
          option2: "2nd option with max length of 15 words",
          option3: "3rd option with max length of 15 words",
        }
      );
    }
    return NextResponse.json(
      {
        questions,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: error.issues,
        },
        {
          status: 400,
        }
      );
    }
  }
};
