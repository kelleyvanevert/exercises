# All kinds of playful interactive exercises to practice on

## The main idea

We want to have playful, interactive exercises for students to work on, to practice and better their understanding through practice. They are decidedly not (only) for evaluative purposes, but:

- for exercise (learn through practice),
- to aid understanding (if they provide visual clues).

This also means that it's a hard sell on certain accounts (the _programming exercise_), because we already have highly interactive medium: your code editor, and your browser.

All together, such an exercise then would have to be accompanied with a smart visual rendering and feedback loop. This (visual, feedback) specificify of an exercise also makes it harder to create different types of exercises.

Effectively, what we need then is a pluggable interface something like:

```ts
interface IExerciseType<IAnswer, IResult, IExercise> {
  // The "front-end" visual organisation and feedback
  //  renderer of an exercise
  ExerciseRenderer: React.ComponentType<{
    exercise: IExercise;
    savedAnswer?: IAnswer;
    evaluation?: IEvaluation<IResult>;
    onAttempt: (answer: IAnswer) => void;
  }>;

  // The evaluative aspect of this exercise type
  evaluate: (attempt: {
    answer: IAnswer;
    exercise: IExercise;
  }) => Promise<IEvaluation<IResult>>;
}

// Split into two parts: `result` being the
//  possibly highly exercise-type-specific result,
//  and `passed` being the derived conclusion
//  on whether this attempt is considered OK or not.
export default interface IEvaluation<IResult> {
  result: IResult;
  passed: boolean;
}
```

I split it into two parts, in order to separate the visual from the evaluative aspect of the exercise type. But it is debatable whether this separation is hard, or maybe too simple (the other way around).

I've parametrized the type over three exercise-type-specific types, although here again the space of possibilities is not entirely clear.

- `IExercise` would be the shape of the problem statement for this kind of exercise. For instance, a multiple choice question could take data like `{ question, choices: Array<{ id, content }>, correctChoiceId }`. Or, a map/reduce/filter programming exercise might have the shape `{ question, data, expected }` (and then intelligently statically enforce programming style in addition to checking the answer dynamically).
- `IAnswer` is self-explanatory: it is type of thing the student attempts. For multiple choice, one of the choices, for a programming exercise, JavaScript code.
- `IResult` would be the possible highly specific evaluation of a student's attempt. For multiple choice, it's just `boolean` or the like, but for a programming exercise it might be the result of computation, or the fact that a type error occurred.

## What it would look like

Spin it up and take a look! `yarn start`

## Currently implemented exercise types

### Multiple choice questions

- **Problem statement**

  ```ts
  interface IExercise {
    question: markdown;
    choices: Array<{ id: ID; content: markdown }>;
    correctChoiceId: ID;

    // config
    randomize?: boolean;
  }
  ```

- **Answer**

  ```ts
  type IAnswer = ID;
  ```

- **Result**

  ```ts
  type IResult = ID;
  ```

- **Evaluation**

  Student passes if answer and result (IDs) are equal.

### Simple code eval

(Just using `eval`, for demonstration purposes.)

- **Problem statement**

  ```ts
  interface IExercise {
    description: markdown; // e.g. "compute 42"
    correctResult: any;
  }
  ```

- **Answer**

  ```ts
  type IAnswer = string; // code
  ```

- **Result**

  ```ts
  interface IResult {
    noErrors: boolean; // no parse errors or exceptions
    computed?: any;
  }
  ```

- **Evaluation**

  Student passes if code evaluates at all, and `result.computed` is equal to
  `exercise.correctResult`.

### Device a CSS selector

- **Problem statement**

  In this exercise type, the student is provided with some HTML markup,
  and some of the elements have been highlighted. The exercise is to
  device a CSS selector that targets precisely those elements.

  ```ts
  interface IExercise {
    question: markdown;
    html: string;
    selector: string; // "known by teacher"
  }
  ```

- **Answer**

  ```ts
  type IAnswer = string; // selector
  ```

- **Result**

  (Not elegantly implemented yet.)

- **Evaluation**

  Student passes if the set of elements matched by the provided
  selector is the same set of elements as matched by the exercise's
  selector.
