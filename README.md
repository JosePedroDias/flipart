# flipart

- original game: https://www.puzzmo.com/play/flip-art/
- canvas API reference: https://simon.html5.org/dump/html5-canvas-cheat-sheet.html

## what it does

- for a given puzzle of W x H dimensions (puzzle generation):
    - randomly places cells with a given density the furthest away possible from each other
    - using manhattan distance, increases the size of each island up until all the matrix is filled
    - elects the pivot point for each piece, avoiding the center of mass (which results in confusing pieces because they're symmetric)
    - picks a random initial orientation for each piece
- rendering and event handling
    - renders each piece to an individual canvas
    - on each tick, draws each piece according to its orientation
    - if user clicks a piece pivot, it is rotated
        - if 1st click, starts clock
        - if all pieces have been correctly aligned, stops the game and displays stats (number of moves and time spent)
- configuration
    - the piece density, colors and visual scale can be tweaked. same for rotation speed.
## how to parameterize it

game can receive the following query params:
- `w` (width) cells in the XX axis (defaults to 6)
- `h` (height) cells in the YY axis (defaults to 8)
- `d` (density) probability of an island to spawn per cell (defaults to 0.27)
- `debug`: shows each piece pivot index and whether it is correctly aligned

examples:
- [default 6x8 w/debug ](http://localhost:8080/index.html?debug=1)
- [8x10                ](http://localhost:8080/index.html?w=8&h=10)
- [10x12               ](http://localhost:8080/index.html?w=10&h=12)
- [16x20 w/0.15 density](http://localhost:8080/index.html?w=16&h=20&d=0.15)

## TODO

- clicking outside of pivots highlights pivots of respective pieces?
- use easing functions instead of linear interpolation
- assign different islands colors from immediate neighbors - https://en.wikipedia.org/wiki/Five_color_theorem
- rewrite rendering to use pixi graphics (mostly to ease other developers into the code)
- dirty flag: only rerender if necessary (to save render cycles and battery)
- save puzzle state (kinda irrelevant since games tend to take a few minutes)
