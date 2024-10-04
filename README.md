# MDWA

![](./images/demo.gif)

This extension is a fork of [Yihao Wang](https://github.com/y1hao)'s [the-most-dangerous-writing-app-extension](https://github.com/y1hao/the-most-dangerous-writing-app-extension). Which is, in turn, a port of the original [The Most Dangerous Writing App](https://github.com/maebert/themostdangerouswritingapp).

Similar to [Yihao Wang](https://github.com/y1hao)'s extension, this extension supplies a command for launching an editor tab that does approximately what is done by [The Most Dangerous Writing App](https://github.com/maebert/themostdangerouswritingapp). The main difference between this extension and that one is that when the writing session is done, this extension prefers to close the editor tab used by the session. In the case of a successful session, the contents of that editor are copied to the position of the cursor in whatever document at the moment the session was launched. In other words, this extension is intended to be used while writing in VS Code.

This extension exposes two settings:

- `mdwa.type` which is either `minutes` or `words`
- `mdwa.limit` which is the number of `mdwa.type` required for a successful session

This extension exposes two commands:

- `mdwa.startSessionWithArgs` allows you to choose the time or word limit at launch
- `mdwa.startSession` uses the extension settings to determine the time or word limit
