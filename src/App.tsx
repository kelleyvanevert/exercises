import * as React from "react";
import "./App.css";
import { markdownMultipleChoice } from "./exercise_types/multipleChoice";
import { simpleCodeEval } from "./exercise_types/simpleCodeEval";
import { IEvaluation, IExerciseType } from "./exercises";

// I'd just love to have an existential type here :)
const exerciseTypes: Array<IExerciseType<unknown, unknown, unknown>> = [
  markdownMultipleChoice,
  simpleCodeEval
];

const exerciseTypesMap = exerciseTypes.reduce((map, exType) => {
  map[exType.id] = exType;
  return map;
}, {});

interface IExerciseItem {
  type: string;
  exercise: unknown;
  savedAnswer?: unknown;
  evaluation: null | IEvaluation<unknown>;
}

interface IState {
  unlockedUpTo: number;
  exerciseItems: IExerciseItem[];
  loading: boolean;
}

class App extends React.Component<{}, IState> {
  state: IState = {
    unlockedUpTo: 0,
    exerciseItems: [],
    loading: true
  };

  async componentDidMount() {
    const response = await fetch("/exercises.json");
    const exerciseItems = (await response.json()) as IExerciseItem[];
    this.setState({
      loading: false,
      exerciseItems: await Promise.all(
        exerciseItems
          .filter(item => !!exerciseTypesMap[item.type])
          .map(async ({ type, exercise }) => {
            const prepare = exerciseTypesMap[type].prepare;
            if (prepare) {
              exercise = await prepare(exercise);
            }
            return { type, exercise, evaluation: null };
          })
      )
    });
  }

  saveAnswer = (i: number, answer: unknown) => {
    this.setState({
      exerciseItems: this.state.exerciseItems.map((item, j) =>
        i === j ? { ...item, savedAnswer: answer } : item
      )
    });
  };

  setEvaluation = (i: number, evaluation: null | IEvaluation<unknown>) => {
    this.setState({
      exerciseItems: this.state.exerciseItems.map((item, j) =>
        i === j ? { ...item, evaluation } : item
      )
    });
  };

  onPass = (i: number) => {
    this.setState({
      unlockedUpTo: Math.max(this.state.unlockedUpTo, i + 1)
    });
  };

  onAttempt = async (i: number, answer: unknown) => {
    const { type, exercise } = this.state.exerciseItems[i];
    const evaluate = exerciseTypesMap[type].evaluate;

    // save before attempt
    this.saveAnswer(i, answer);

    // evaluate
    const evaluation = await evaluate({
      answer,
      exercise
    });
    this.setEvaluation(i, evaluation);

    // possibly pass
    if (evaluation.passed) {
      this.onPass(i);
    }
  };

  startOver = () => {
    this.setState({
      unlockedUpTo: 0,
      exerciseItems: this.state.exerciseItems.map(item => {
        const copy = {
          ...item,
          evaluation: null
        };
        delete copy.savedAnswer;
        return copy;
      })
    });
  };

  render() {
    const { loading, unlockedUpTo, exerciseItems } = this.state;

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
            {exerciseItems
              .slice(0, unlockedUpTo + 1)
              .map(({ type, exercise, savedAnswer, evaluation }, i) => {
                const ExerciseRenderer =
                  exerciseTypesMap[type].ExerciseRenderer;
                return (
                  <li key={i}>
                    <div>
                      Exercise {i + 1} / {exerciseItems.length}
                    </div>
                    <ExerciseRenderer
                      key={savedAnswer}
                      exercise={exercise}
                      savedAnswer={savedAnswer}
                      evaluation={evaluation}
                      onAttempt={(answer: unknown) => this.onAttempt(i, answer)}
                      onRetry={() => this.setEvaluation(i, null)}
                    />
                  </li>
                );
              })}
            {unlockedUpTo === exerciseItems.length ? (
              <li>
                <strong>Congratulations!</strong> You made it through all the
                exercises. This also means that we're quite confident you
                understand this topic well.
                <div>
                  <a href="#" onClick={this.startOver}>
                    Start over
                  </a>
                </div>
              </li>
            ) : null}
          </ul>
        )}
      </div>
    );
  }
}

export default App;
