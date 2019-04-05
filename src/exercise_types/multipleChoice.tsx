import * as React from "react";
import * as ReactMarkdown from "react-markdown";
import { IExerciseType } from "../exercises";

type markdown = string;
type ID = any;

interface IChoice<IChoiceContent> {
  id: ID;
  content: IChoiceContent;
}

type IAnswer = ID;

interface IResult {
  ok: boolean;
  choiceId: ID;
}

interface IExercise<IChoiceContent> {
  question: markdown;
  choices: Array<IChoice<IChoiceContent>>;
  correctChoiceId: ID;
  randomize?: boolean;
}

function shuffle(a: unknown[]) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function makeMultipleChoiceExerciseType<IChoiceContent>(
  id: string,
  ChoiceContentRenderer: React.ComponentType<{
    content: IChoiceContent;
    ok?: boolean;
  }>
): IExerciseType<IAnswer, IResult, IExercise<IChoiceContent>> {
  return {
    id,

    async prepare(exercise) {
      if (exercise.randomize) {
        shuffle(exercise.choices);
      }
      return exercise;
    },

    ExerciseRenderer({
      exercise: { question, choices, randomize },
      evaluation,
      onAttempt,
      onRetry
    }) {
      return (
        <div>
          <ReactMarkdown source={question} />
          <ul>
            {choices.map(choice => (
              <li
                key={choice.id}
                onClick={() => (evaluation ? null : onAttempt(choice))}
              >
                <ChoiceContentRenderer
                  content={choice.content}
                  ok={
                    evaluation && evaluation.result.choiceId === choice.id
                      ? evaluation.passed
                      : undefined
                  }
                />
              </li>
            ))}
          </ul>
          {evaluation ? (
            <div>
              <a href="#" onClick={onRetry}>
                Try again
              </a>
            </div>
          ) : null}
        </div>
      );
    },

    async evaluate({ answer: choice, exercise: { correctChoiceId } }) {
      const ok = choice.id === correctChoiceId;
      return {
        result: {
          ok,
          choiceId: choice.id
        },
        passed: ok
      };
    }
  };
}

export const markdownMultipleChoice = makeMultipleChoiceExerciseType<markdown>(
  "md_multi",
  ({ content, ok }) => {
    const color = ok === undefined ? "inherit" : ok ? "green" : "red";
    const annotation = ok === undefined ? null : ok ? "✓" : "✗";
    return (
      <div style={{ color }}>
        {annotation ? (
          <div style={{ float: "left", marginRight: 10 }}>{annotation}</div>
        ) : null}
        <ReactMarkdown source={content} />
      </div>
    );
  }
);
