import * as React from "react";
import "./App.css";
import { markdownMultipleChoice } from "./exercise_types/multipleChoice";
import { simpleCodeEval } from "./exercise_types/simpleCodeEval";
import { makeExerciseRenderer } from "./exercises";

const renderers = {
  md_multi: makeExerciseRenderer(markdownMultipleChoice),
  eval: makeExerciseRenderer(simpleCodeEval)
};

interface IExercise {
  type: string;
}

interface IState {
  at: number;
  progress: Array<{
    exercise: IExercise;
    savedAnswer?: unknown;
  }>;
  loading: boolean;
}

class App extends React.Component<{}, IState> {
  state: IState = {
    at: 0,
    progress: [],
    loading: true
  };

  async componentDidMount() {
    const response = await fetch("/exercises.json");
    const exercises = await response.json();
    this.setState({
      loading: false,
      progress: exercises.map((exercise: IExercise) => ({
        exercise
      }))
    });
  }

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
  /*
  startOver = () => {
    this.setState({
      progress: this.state.progress.map(({ exercise }) => ({ exercise }))
    });
  };
  */
  render() {
    const { loading, at, progress } = this.state;

    return (
      <div>
        <h2>Exercises</h2>
        <p>
          These exercises are only meant for you: to practice and gain
          understanding through it. They are not evaluated formally. You may
          choose to practice as little or often as you think is necessary. Your
          answers are automatically saved, so you don't have to worry about
          losing them.
        </p>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <ul>
            {progress.slice(0, at + 1).map(({ exercise, savedAnswer }, i) => {
              const ExerciseRenderer = renderers[exercise.type];
              return (
                <li key={i}>
                  <div>
                    Exercise {i + 1} / {progress.length}
                  </div>
                  <ExerciseRenderer
                    exercise={exercise}
                    savedAnswer={savedAnswer}
                    onPass={this.onPass}
                    onSave={this.onSave}
                  />
                </li>
              );
            })}
          </ul>
        )}
        {at === progress.length ? (
          <p>
            <strong>Congratulations!</strong> You made it through all the
            exercises. This also means that we're quite confident you understand
            this topic well.
          </p>
        ) : null}
      </div>
    );
  }
}

export default App;
