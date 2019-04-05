import classNames from "classnames";
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
          <ul className="list-group mb-3">
            {choices.map(choice => {
              const isAnswer =
                evaluation && evaluation.result.choiceId === choice.id;
              return (
                <li
                  key={choice.id}
                  style={{ cursor: "pointer" }}
                  className={classNames({
                    "pb-0": true, // to make up for the content's bottom margin
                    "list-group-item": true,
                    "list-group-item-action": !evaluation,
                    "list-group-item-success":
                      evaluation && isAnswer && evaluation.passed,
                    "list-group-item-danger":
                      evaluation && isAnswer && !evaluation.passed
                  })}
                  onClick={() => (evaluation ? null : onAttempt(choice))}
                >
                  <ChoiceContentRenderer content={choice.content} />
                </li>
              );
            })}
          </ul>
          {evaluation ? (
            <div>
              <a href="#" onClick={onRetry}>
                {evaluation.passed ? "Clear" : "Try again"}
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
  ({ content }) => {
    return <ReactMarkdown source={content} />;
  }
);
