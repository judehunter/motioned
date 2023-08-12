# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

## 0.0.2 - 2023-08-12
### Added
- `times` key. You can set the times (or offsets) of each keyframe in a tween animation.
  
  This lets you specify when a given keyframe is on the timeline using a fraction of the duration.
  
  The times array should have the same length as your keyframe array. Only numbers 0-1 allowed.
  
  ```jsx
  return (
    <m.div
      animate={{
        height: [0, '80%', '98%', '80%', '50%'],
        transition: {
          times: [0, 0.5, 0.6, 0.9, 1],
          duration: 5000,
        },
      }}
    />
  );
  ```
- Custom cubic bézier easings. You can use any cubic bézier by specifying its points in a tuple.
  
  ```jsx
  return (
    <m.div
      animate={{
        height: 100,
        transition: {
          easing: [0.58, 0.04, 0.21, 0.64],
        },
      }}
    />
  );
  ```
- Easing list. You can use different easings between pairs of keyframes by specifying them in an array.
  
  The length of the easing array must be one smaller than the number of keyframes.
  
  ```jsx
  return (
    <m.div
      animate={{
        height: [0, '80%', '98%', '80%', '50%'],
        transition: {
          easing: [
            [0, 0.55, 0.45, 1],
            'ease-in-out',
            (t) => t ** 2,
            [0.68, -0.6, 0.32, 1.6],
          ],
        },
      }}
    />
  );
  ```
- Predefined easings. You can use some predefined easings beyond just the native ones like `ease`.
  
  The list, along with their bezier definitions:
  
  ```jsx
  'circ-in':     [0.55, 0, 1, 0.45],
  'circ-out':    [0, 0.55, 0.45, 1],
  'circ-in-out': [0.85, 0, 0.15, 1],
  'back-in':     [0.36, 0, 0.66, -0.56],
  'back-out':    [0.34, 1.56, 0.64, 1],
  'back-in-out': [0.68, -0.6, 0.32, 1.6],
  ```
