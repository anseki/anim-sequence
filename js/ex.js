/* exported initTimeline */

function initTimeline(view, valueCallback, frameCallback, duration, timing, repeatInterval) {
  'use strict';

  var
    SCALE_WIDTH = 740,
    POINTER_WIDTH = 32,
    POINTER_HEIGHT = 32,
    POINTER_TOP_OFFSET = 24,
    POINTER_MIN_LEFT = -POINTER_WIDTH / 2,
    POINTER_MAX_LEFT = SCALE_WIDTH - POINTER_WIDTH / 2,
    POINTER_LEN = POINTER_MAX_LEFT - POINTER_MIN_LEFT,

    panel = view.parentNode.insertBefore(document.createElement('div'), view.nextSibling),
    playButton = panel.appendChild(document.createElement('button')),
    reverseCheck = document.createElement('input'),
    timeScale = panel.appendChild(document.createElement('div')),
    timePoint = timeScale.appendChild(document.createElement('div')),
    timePointStyle = timePoint.style,

    playing = false, reverse = false, timeRatio = 0,
    animId, repeatTimer, draggable, pointBBox;

  function setTimeScale(timeRatio) {
    timePointStyle.left = timeRatio * POINTER_LEN + POINTER_MIN_LEFT + 'px';
  }

  function playStop(forcePlay) {
    clearTimeout(repeatTimer);
    if (typeof forcePlay === 'boolean') {
      if (playing === forcePlay) { return; }
      playing = forcePlay;
    } else {
      playing = !playing;
    }
    if (playing) {
      playButton.classList.add('playing');
      AnimSequence.start(animId, reverse, timeRatio);
    } else {
      playButton.classList.remove('playing');
      timeRatio = AnimSequence.stop(animId);
      draggable.position();
    }
  }

  panel.className = 'panel';
  playButton.className = 'play-button';
  playButton.appendChild(document.createElement('div'));
  playButton.addEventListener('click', playStop, false);

  reverseCheck.type = 'checkbox';
  var label = panel.appendChild(document.createElement('label'));
  label.textContent = 'reverse';
  label.insertBefore(reverseCheck, label.firstChild);
  reverseCheck.addEventListener('click', function() {
    reverse = reverseCheck.checked;
    AnimSequence.start(animId, reverse, timeRatio);
  }, false);

  timeScale.className = 'time-scale';
  timePoint.className = 'time-point';
  timePoint.appendChild(document.createElement('div')); // Trigone Pointer

  timeScale.addEventListener('click', function() {
    playStop(false);
  }, false);

  pointBBox = timeScale.getBoundingClientRect();
  pointBBox = {
    left: pointBBox.left + window.pageXOffset - POINTER_WIDTH / 2,
    top: pointBBox.top + window.pageYOffset + POINTER_TOP_OFFSET,
    width: pointBBox.width + POINTER_WIDTH,
    height: POINTER_HEIGHT
  };
  draggable = new Draggable(timePoint, {
    containment: pointBBox,
    onDrag: function() {
      playStop(false);
    },
    onMove: function(bBox) {
      timeRatio = (bBox.left - pointBBox.left) / POINTER_LEN;
      AnimSequence.start(animId, reverse, timeRatio);
    }
  });

  animId = AnimSequence.add(
    valueCallback,
    function(value, finish, curTimeRatio, outputRatio) {
      timeRatio = curTimeRatio;
      frameCallback(value, finish, timeRatio, outputRatio);
      setTimeScale(timeRatio);

      if (finish) {
        repeatTimer = setTimeout(function() {
          if (playing) {
            AnimSequence.start(animId, reverse);
          }
        }, repeatInterval || 0);
      }
      return playing;
    }, duration, 1, timing, false, false);

  var tip = panel.appendChild(document.createElement('span'));
  tip.className = 'tip';
  tip.textContent = 'Drag Pointer';

  playStop();
}
