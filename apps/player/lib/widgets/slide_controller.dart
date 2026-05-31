import 'dart:async';
import 'package:flutter/material.dart';

import 'motion.dart';

/// Drives the wrapped's slide sequence. Each slide gets [Duration] on screen
/// (default 3s per PRD §6.4; pass per-slide overrides if needed).
class SlideController extends StatefulWidget {
  final List<Widget> slides;
  final List<Duration> durations;
  final VoidCallback? onEnded;

  const SlideController({
    super.key,
    required this.slides,
    required this.durations,
    this.onEnded,
  }) : assert(slides.length == durations.length,
            'slides and durations must be the same length');

  @override
  State<SlideController> createState() => _SlideControllerState();
}

class _SlideControllerState extends State<SlideController>
    with SingleTickerProviderStateMixin {
  late final PageController _pageController;
  // Drives the active pip's left→right fill over the current slide's duration.
  late final AnimationController _pipController;
  int _index = 0;
  Timer? _timer;
  bool _ended = false;

  @override
  void initState() {
    super.initState();
    _pageController = PageController();
    _pipController = AnimationController(vsync: this);
    _scheduleNext();
  }

  @override
  void dispose() {
    _timer?.cancel();
    _pipController.dispose();
    _pageController.dispose();
    super.dispose();
  }

  // Restart the active pip's fill animation for the current slide's duration.
  // Under reduced-motion we snap it full (no sweeping bar).
  void _restartPip() {
    _pipController.stop();
    _pipController.duration = widget.durations[_index];
    _pipController.value = 0.0;
    if (reduceMotionOf(context)) {
      _pipController.value = 1.0;
    } else {
      _pipController.forward();
    }
  }

  void _scheduleNext() {
    _timer?.cancel();
    // Kick the pip fill for this slide. On the very first schedule (from
    // initState) the element isn't mounted yet, so defer to the first frame
    // where context/reduced-motion is available; on re-schedules run now.
    if (mounted) {
      _restartPip();
    } else {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) _restartPip();
      });
    }
    _timer = Timer(widget.durations[_index], () {
      if (!mounted) return;
      if (_index < widget.slides.length - 1) {
        setState(() => _index += 1);
        _pageController.animateToPage(
          _index,
          duration: const Duration(milliseconds: 450),
          curve: Curves.easeOutCubic,
        );
        _scheduleNext();
      } else if (!_ended) {
        _ended = true;
        _pipController.value = 1.0;
        widget.onEnded?.call();
      }
    });
  }

  void _advance(int delta) {
    final next = (_index + delta).clamp(0, widget.slides.length - 1);
    if (next == _index) return;
    setState(() => _index = next);
    _pageController.animateToPage(
      _index,
      duration: const Duration(milliseconds: 300),
      curve: Curves.easeOutCubic,
    );
    _scheduleNext();
  }

  @override
  Widget build(BuildContext context) {
    final reduceMotion = reduceMotionOf(context);
    return Stack(
      children: [
        PageView.builder(
          controller: _pageController,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: widget.slides.length,
          itemBuilder: (context, i) {
            final slide = widget.slides[i];
            if (reduceMotion) return slide;
            // Cinematic transition: as the PageView scrolls, the incoming
            // slide fades up and scales from 0.92→1.0 with a slight parallax,
            // while the outgoing one fades/recedes. Driven by the page offset
            // relative to this item's index.
            return AnimatedBuilder(
              animation: _pageController,
              child: slide,
              builder: (context, child) {
                double page = i.toDouble();
                if (_pageController.hasClients &&
                    _pageController.position.haveDimensions) {
                  page = _pageController.page ?? _index.toDouble();
                }
                final delta = (i - page).clamp(-1.0, 1.0);
                final t = 1.0 - delta.abs(); // 1 at center, 0 at neighbor
                final opacity = Curves.easeOut.transform(t.clamp(0.0, 1.0));
                final scale = 0.92 + 0.08 * t;
                return Opacity(
                  opacity: opacity,
                  child: Transform.scale(
                    scale: scale,
                    child: Transform.translate(
                      // Subtle parallax: neighbors drift horizontally.
                      offset: Offset(delta * -24, 0),
                      child: child,
                    ),
                  ),
                );
              },
            );
          },
        ),
        // Tap zones — left half = back, right half = forward.
        Positioned.fill(
          child: Row(
            children: [
              Expanded(
                child: GestureDetector(
                  behavior: HitTestBehavior.translucent,
                  onTap: () => _advance(-1),
                ),
              ),
              Expanded(
                child: GestureDetector(
                  behavior: HitTestBehavior.translucent,
                  onTap: () => _advance(1),
                ),
              ),
            ],
          ),
        ),
        // Slide progress pips — Stories-style. Past slides read full, the
        // active one fills left→right over its duration, future ones sit dim.
        Positioned(
          top: 16,
          left: 16,
          right: 16,
          child: Row(
            children: List.generate(widget.slides.length, (i) {
              return Expanded(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 2),
                  child: _ProgressPip(
                    state: i < _index
                        ? _PipState.done
                        : i == _index
                            ? _PipState.active
                            : _PipState.upcoming,
                    fill: _pipController,
                  ),
                ),
              );
            }),
          ),
        ),
      ],
    );
  }
}

enum _PipState { done, active, upcoming }

/// A single progress pip. `done` = solid white, `upcoming` = dim track,
/// `active` = dim track with a white sub-bar that sweeps to full width as the
/// [fill] animation (the slide's on-screen timer) advances.
class _ProgressPip extends StatelessWidget {
  final _PipState state;
  final Animation<double> fill;
  const _ProgressPip({required this.state, required this.fill});

  @override
  Widget build(BuildContext context) {
    final track = Colors.white.withValues(alpha: 0.25);
    if (state == _PipState.done) {
      return _bar(Colors.white, 1.0, track);
    }
    if (state == _PipState.upcoming) {
      return _bar(Colors.white, 0.0, track);
    }
    return AnimatedBuilder(
      animation: fill,
      builder: (context, _) => _bar(Colors.white, fill.value, track),
    );
  }

  Widget _bar(Color fg, double t, Color track) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(2),
      child: Container(
        height: 3,
        color: track,
        child: FractionallySizedBox(
          alignment: Alignment.centerLeft,
          widthFactor: t.clamp(0.0, 1.0),
          child: Container(color: fg),
        ),
      ),
    );
  }
}
