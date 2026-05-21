import 'dart:async';
import 'package:flutter/material.dart';

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

class _SlideControllerState extends State<SlideController> {
  late final PageController _pageController;
  int _index = 0;
  Timer? _timer;
  bool _ended = false;

  @override
  void initState() {
    super.initState();
    _pageController = PageController();
    _scheduleNext();
  }

  @override
  void dispose() {
    _timer?.cancel();
    _pageController.dispose();
    super.dispose();
  }

  void _scheduleNext() {
    _timer?.cancel();
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
    return Stack(
      children: [
        PageView.builder(
          controller: _pageController,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: widget.slides.length,
          itemBuilder: (context, i) => widget.slides[i],
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
        // Slide progress pips.
        Positioned(
          top: 16,
          left: 16,
          right: 16,
          child: Row(
            children: List.generate(widget.slides.length, (i) {
              return Expanded(
                child: Container(
                  height: 3,
                  margin: const EdgeInsets.symmetric(horizontal: 2),
                  decoration: BoxDecoration(
                    color: i <= _index
                        ? Colors.white
                        : Colors.white.withValues(alpha: 0.25),
                    borderRadius: BorderRadius.circular(2),
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
