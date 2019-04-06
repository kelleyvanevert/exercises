import classNames from "classnames";
import * as CSSselect from "css-select";
import * as adapter_a from "css-select-browser-adapter";
import parse from "mini-html-parser";
import * as React from "react";
import * as ReactMarkdown from "react-markdown";
import { IExerciseRenderer, IExerciseType } from "../exercises";

type markdown = string;

type IAnswer = string;

interface IResult {
  // possibly a dom tree or something
  ok: boolean;
}

interface IExercise {
  question: markdown;
  html: string;
  selector: string | string[];
}

const adapter = {
  ...adapter_a,
  getName(node: IDomNode) {
    return (node.nodeName || "").toLowerCase();
  }
};

type Pred = (node: IDomNode) => boolean;

function compile(selector: string, options: any): Pred {
  // guard an edge-case
  if (!selector.trim().match(/[*a-z0-9\]]$/)) {
    return n => false;
  }

  // solve a wrong typing with an assertion
  return (CSSselect.compile as (a: any, b: any) => any)(selector, options);
}

const isExact = (node: IDomNode, a: Pred, b: Pred): boolean => {
  if (node.nodeName === "#text") {
    return true;
  }
  return a(node) === b(node)
    ? node.childNodes.every(child => isExact(child, a, b))
    : false;
};

type IProps = React.ComponentProps<
  IExerciseRenderer<IAnswer, IResult, IExercise>
>;

interface IState {
  selector: string;
  dom: any;
  todo: Pred;
  curr: Pred;
  exact: boolean;
}

export const deviseCssSelector: IExerciseType<IAnswer, IResult, IExercise> = {
  id: "devise_css_selector",

  async prepare(exercise) {
    if (exercise.selector instanceof Array) {
      return exercise.selector.map(selector => ({ ...exercise, selector }));
    }
    return [exercise];
  },

  ExerciseRenderer: class extends React.Component<IProps, IState> {
    constructor(props: IProps) {
      super(props);
      const parser = parse(props.exercise.html);
      const dom = parser.parse();

      const todo = compile(props.exercise.selector as string, { adapter });

      const selector = props.savedAnswer || "";
      let curr: Pred = () => false;
      try {
        curr = compile(selector, { adapter });
      } catch (__) {
        //
      }

      this.state = {
        selector: props.savedAnswer || "",
        dom,
        todo,
        curr,
        exact: isExact(dom, todo, curr)
      };
    }

    check = () => {
      this.props.onAttempt(this.state.selector);
    };

    onChange = (e: any) => {
      const selector = e.target.value;
      let curr: Pred = () => false;

      try {
        curr = compile(selector, { adapter });
      } catch (__) {
        //
      }

      const exact = isExact(this.state.dom, this.state.todo, curr);

      this.setState({
        selector,
        curr,
        exact
      });
    };

    retry = () => {
      const { onRetry } = this.props;
      this.setState({
        selector: ""
      });
      onRetry();
    };

    render() {
      const {
        exercise: { question }
      } = this.props;

      const { exact } = this.state;

      return (
        <div>
          <ReactMarkdown source={question} />
          <div className="form-group">
            <input
              type="text"
              className={classNames({
                "form-control": true,
                "is-valid": exact
              })}
              value={this.state.selector}
              onChange={this.onChange}
              placeholder="CSS selector"
            />
            {exact ? (
              <div className="valid-feedback">That's correct!</div>
            ) : null}
          </div>
          <div className="mb-3">
            <DomNode
              node={this.state.dom}
              todo={this.state.todo}
              curr={this.state.curr}
            />
          </div>
          {/*<pre>
            <code>{html}</code>
          </pre>*/}
          {exact ? (
            <p>
              <button
                type="button"
                className="btn btn-primary"
                onClick={this.check}
              >
                Continue
              </button>
            </p>
          ) : null}
        </div>
      );
    }
  },

  async evaluate({ answer, exercise: { html } }) {
    return {
      result: {
        ok: true
      },
      passed: true
    };
  }
};

interface IDomNode {
  attributes?: {
    [str: string]: string;
  };
  childNodes: IDomNode[];
  nodeValue: string;

  nodeName: string;
  nodeType: number;

  parentNode?: IDomNode;
  nextSibling?: IDomNode;
  previousSibling?: IDomNode;
  firstChild?: IDomNode;
  lastChild?: IDomNode;
}

function openTag(node: IDomNode, todo: boolean, selected: boolean) {
  return (
    <span className={classNames({ "open-tag": true, todo, selected })}>
      &lt;
      <span>{node.nodeName.toLowerCase()}</span>
      {node.attributes ? (
        <span>
          {Object.entries(node.attributes).map(([k, v]) => (
            <span key={k} style={{ marginLeft: 6 }}>
              {k}="{v}"
            </span>
          ))}
        </span>
      ) : null}
      &gt;
    </span>
  );
}

function DomNode({
  node,
  todo,
  curr
}: {
  node: IDomNode;
  todo: Pred;
  curr: Pred;
}) {
  if (node.nodeName === "#text") {
    return <span>{node.nodeValue}</span>;
  }
  const isTextual = node.childNodes.every(n => n.nodeName === "#text");

  return (
    <div className="dom-node">
      {isTextual ? (
        <span>
          {openTag(node, todo(node), curr(node))}
          {node.childNodes.map((childNode, i) => (
            <span key={i}>
              <DomNode node={childNode} todo={todo} curr={curr} />
            </span>
          ))}
          <span className="close-tag">
            &lt;/{node.nodeName.toLowerCase()}&gt;
          </span>
        </span>
      ) : (
        <>
          <div>{openTag(node, todo(node), curr(node))}</div>
          <ul className="list-unstyled" style={{ paddingLeft: 20 }}>
            {node.childNodes
              .filter(n => n.nodeName !== "#text")
              .map((childNode, i) => (
                <li key={i}>
                  <DomNode node={childNode} todo={todo} curr={curr} />
                </li>
              ))}
          </ul>
          <div className="close-tag">
            &lt;/{node.nodeName.toLowerCase()}&gt;
          </div>
        </>
      )}
    </div>
  );
}
