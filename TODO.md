vaguely priority-ordered nested todo list. Feel free to replace with something fancier if you like

- add bpm to firebase

- Clean code
  - put different views in separate html files
  X separate js in some reasonable way
  X separate css
  X reformat editor code to match angularjs style
  - better documentation (partially done)

  
- UI
  - make interface clean and easy to use


X Customise grid dimensions (number of grid divisions per beat, number of beats per gridbox thing)

X Play / pause

- High-level editor
  - look into interact.js for dragging stuff around

- More instruments


- Save / load song to disk (custom format or MIDI or both?)

- More in-depth parameters for notes: e.g change volume, adsr envelope
  - Might be smart to synthesize instead of sample playback. Not sure if JS audio synthesis is feasible
  - Maybe you could optionally place notes that aren't aligned with the grid? Like a real midi editor

- Export to mp3

- Custom sample upload

X Individual collaborative songs / chatrooms
  X (I was thinking something like spyfall.crabhat.com
     where P1 presses 'new' and gets a code, sends it to P2,
     then P2 presses 'join', types in the code and joins in.
     I think this would be ~simple with firebase)
  X Create / join room
  X need to integrate the actual sequence editor

X Implement chat window (firebase)

X Save / load song to cloud (firebase)

X Change tempo