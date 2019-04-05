import * as React from "react";
import "./App.css";
import { markdownMultipleChoice } from "./exercise_types/multipleChoice";
import { simpleCodeEval } from "./exercise_types/simpleCodeEval";
import { makeExerciseRenderer } from "./exercises";

const renderers = {
  md_multi: makeExerciseRenderer(markdownMultipleChoice),
  eval: makeExerciseRenderer(simpleCodeEval)
};

const exercises = [
  {
    type: "md_multi",
    question: "Which of the following is most true?",
    options: [
      "Markdown is wonderful",
      "TypeScript is great",
      "Generic types are hard"
    ],
    correctIndex: 1
  },
  {
    type: "md_multi",
    question: "Which of the following is most true?",
    options: [
      "Markdown is wonderful",
      "TypeScript is great",
      "Generic types are hard"
    ],
    correctIndex: 1
  },
  {
    type: "eval",
    description: "Compute the number 42",
    correctResult: 42
  }
];

interface IState {
  at: number;
  progress: Array<{
    exercise: { type: string };
    savedAnswer?: unknown;
  }>;
}

class App extends React.Component<{}, IState> {
  state: IState = {
    at: 0,
    progress: exercises.map(exercise => ({
      exercise,
      passed: false
    }))
  };

  onSave = (answer: unknown) => {
    this.setState({
      progress: this.state.progress.map((obj, i) =>
        i === this.state.at ? { ...obj, savedAnswer: answer } : obj
      )
    });
  };

  onPass = () => {
    const { at } = this.state;
    this.setState({
      at: at + 1
    });
  };

  render() {
    const { at, progress } = this.state;

    return (
      <div>
        {progress.slice(0, at + 1).map(({ exercise, savedAnswer }, i) => {
          const ExerciseRenderer = renderers[exercise.type];
          return (
            <ExerciseRenderer
              key={i}
              exercise={exercise}
              savedAnswer={savedAnswer}
              onPass={this.onPass}
              onSave={this.onSave}
            />
          );
        })}
      </div>
    );
  }
}

export default App;
