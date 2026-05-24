import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';

/// Single-color VS Code codicon. The SVGs ship as black-on-transparent; we
/// recolor via a color filter so they take on the slide palette instead of
/// fighting it as raw black.
class Codicon extends StatelessWidget {
  final String name;
  final double size;
  final Color color;

  const Codicon({
    super.key,
    required this.name,
    required this.size,
    this.color = Colors.white,
  });

  @override
  Widget build(BuildContext context) {
    return SvgPicture.asset(
      'assets/codicons/$name.svg',
      width: size,
      height: size,
      colorFilter: ColorFilter.mode(color, BlendMode.srcIn),
    );
  }
}
