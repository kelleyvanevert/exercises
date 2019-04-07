import * as React from "react";
import "./App.css";
import { deviseCssSelector } from "./exercise_types/deviseCssSelector";
import { fpExpression } from "./exercise_types/fpExpression";
import { markdownMultipleChoice } from "./exercise_types/multipleChoice";
import { simpleCodeEval } from "./exercise_types/simpleCodeEval";
import { IEvaluation, IExerciseType } from "./exercises";

// I'd just love to have an existential type here :)
const exerciseTypes: Array<
  IExerciseType<unknown, unknown, unknown, unknown>
> = [markdownMultipleChoice, simpleCodeEval, deviseCssSelector, fpExpression];

const exerciseTypesMap: {
  [name: string]: IExerciseType<unknown, unknown, unknown, unknown>;
} = exerciseTypes.reduce((map, exType) => {
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
    const data = await response.json();
    this.setState({
      loading: false,
      exerciseItems: (await Promise.all(
        data
          .filter((item: { type: string }) => !!exerciseTypesMap[item.type])
          .map(async (item: any) => {
            const expand = exerciseTypesMap[item.type].expand;
            if (!expand && "exerciseSet" in item) {
              console.log("ERR: cannot expand exercise set:", item);
              return [];
            }
            let items =
              expand && "exerciseSet" in item
                ? expand(item.exerciseSet).map(exercise => ({
                    type: item.type,
                    exercise,
                    evaluation: null
                  }))
                : [{ ...item, evaluation: null }];

            const prepare =
              exerciseTypesMap[item.type].prepare ||
              Promise.resolve.bind(Promise);
            items = await Promise.all(
              items.map(async (itm: any) => ({
                ...itm,
                exercise: await prepare(itm.exercise)
              }))
            );

            return items;
          })
      )).flat()
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
      <div className="container mt-5" style={{ marginBottom: "20rem" }}>
        <div className="row">
          <div className="col-md-10 offset-md-1 col-lg-8 offset-lg-2">
            <h1 className="mb-4">Exercises</h1>
            <div className="lead mb-5">
              <p>
                These exercises are only meant for you: to practice and gain
                understanding through it. They are not evaluated formally. You
                may choose to practice as little or often as you think is
                necessary. Your answers are automatically saved, so you don't
                have to worry about losing them.
              </p>
              <p>
                <a href="https://github.com/kelleyvanevert/exercises">
                  What's this about?
                </a>
              </p>
            </div>
            {loading ? (
              <p>Loading...</p>
            ) : (
              <ul className="list-unstyled">
                {exerciseItems
                  .slice(0, unlockedUpTo + 1)
                  .map(({ type, exercise, savedAnswer, evaluation }, i) => {
                    const ExerciseRenderer =
                      exerciseTypesMap[type].ExerciseRenderer;
                    return (
                      <li key={i} className="mb-4">
                        <h5>
                          Exercise {i + 1} / {exerciseItems.length}
                        </h5>
                        <ExerciseRenderer
                          key={JSON.stringify(savedAnswer)}
                          exercise={exercise}
                          savedAnswer={savedAnswer}
                          evaluation={evaluation}
                          onAttempt={(answer: unknown) =>
                            this.onAttempt(i, answer)
                          }
                          onRetry={() => this.setEvaluation(i, null)}
                        />
                      </li>
                    );
                  })}
                {unlockedUpTo === exerciseItems.length ? (
                  <li>
                    <h3>Congratulations!</h3>
                    <p className="lead">
                      You made it through all the exercises. This also means
                      that we're quite confident you understand this topic well.
                    </p>
                    <div>
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={this.startOver}
                      >
                        Start over
                      </button>
                    </div>
                  </li>
                ) : null}
              </ul>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default App;
