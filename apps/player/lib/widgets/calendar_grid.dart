import 'package:flutter/material.dart';

/// 52-week grid that animates active days filling in.
class CalendarStreakGrid extends StatefulWidget {
  final int streakDays; // length of the longest streak
  final int totalCells; // total cells to draw (default 52*7)
  final int startCell; // cell index where the streak begins
  final Color cellColor; // active streak color
  final Color baseColor; // base (inactive) color
  final Duration duration;

  const CalendarStreakGrid({
    super.key,
    required this.streakDays,
    required this.cellColor,
    this.totalCells = 52 * 7,
    this.startCell = 0,
    this.baseColor = const Color(0xFF1F1F1F),
    this.duration = const Duration(milliseconds: 1800),
  });

  @override
  State<CalendarStreakGrid> createState() => _CalendarStreakGridState();
}

class _CalendarStreakGridState extends State<CalendarStreakGrid>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late Animation<double> _anim;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(vsync: this, duration: widget.duration);
    _anim = CurvedAnimation(parent: _controller, curve: Curves.easeOutCubic);
    _controller.forward();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        const cols = 52;
        const rows = 7;
        final cellSize = (constraints.maxWidth / cols).clamp(2.0, 10.0);
        final gap = cellSize * 0.2;
        final width = (cellSize + gap) * cols;
        final height = (cellSize + gap) * rows;
        return AnimatedBuilder(
          animation: _anim,
          builder: (context, _) {
            final filled = (_anim.value * widget.streakDays).round();
            return SizedBox(
              width: width,
              height: height,
              child: Stack(
                children: List.generate(widget.totalCells, (idx) {
                  final col = idx ~/ rows;
                  final row = idx % rows;
                  final left = col * (cellSize + gap);
                  final top = row * (cellSize + gap);
                  final inStreak = idx >= widget.startCell &&
                      idx < widget.startCell + filled;
                  return Positioned(
                    left: left,
                    top: top,
                    width: cellSize,
                    height: cellSize,
                    child: Container(
                      decoration: BoxDecoration(
                        color:
                            inStreak ? widget.cellColor : widget.baseColor,
                        borderRadius: BorderRadius.circular(cellSize * 0.2),
                      ),
                    ),
                  );
                }),
              ),
            );
          },
        );
      },
    );
  }
}
