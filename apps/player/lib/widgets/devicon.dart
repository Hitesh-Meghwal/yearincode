import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';

/// Maps GitHub Linguist language names to Devicon asset slugs. Lookup is
/// case-insensitive — the keys are kept lowercase. Any language we don't
/// have a Devicon for falls back to a first-letter tile, so the layout
/// stays whole even for exotic detections.
const Map<String, String> _languageToSlug = {
  'javascript': 'javascript',
  'js': 'javascript',
  'typescript': 'typescript',
  'ts': 'typescript',
  'tsx': 'typescript',
  'python': 'python',
  'py': 'python',
  'java': 'java',
  'kotlin': 'kotlin',
  'swift': 'swift',
  'objective-c': 'objectivec',
  'objectivec': 'objectivec',
  'objc': 'objectivec',
  'c': 'c',
  'c++': 'cplusplus',
  'cpp': 'cplusplus',
  'c#': 'csharp',
  'csharp': 'csharp',
  'go': 'go',
  'golang': 'go',
  'rust': 'rust',
  'ruby': 'ruby',
  'rb': 'ruby',
  'php': 'php',
  'dart': 'dart',
  'scala': 'scala',
  'groovy': 'groovy',
  'clojure': 'clojure',
  'clojurescript': 'clojurescript',
  'haskell': 'haskell',
  'elixir': 'elixir',
  'ex': 'elixir',
  'erlang': 'erlang',
  'elm': 'elm',
  'lua': 'lua',
  'perl': 'perl',
  'f#': 'fsharp',
  'fsharp': 'fsharp',
  'ocaml': 'ocaml',
  'racket': 'racket',
  'crystal': 'crystal',
  'gleam': 'gleam',
  'nim': 'nim',
  'zig': 'zig',
  'julia': 'julia',
  'r': 'r',
  'matlab': 'matlab',
  'coffeescript': 'coffeescript',
  'purescript': 'purescript',
  'vala': 'vala',
  'solidity': 'solidity',
  'vyper': 'vyper',
  'haxe': 'haxe',
  'ballerina': 'ballerina',
  'apex': 'apex',
  'visual basic': 'visualbasic',
  'vb': 'visualbasic',
  'delphi': 'delphi',
  'fortran': 'fortran',
  'cobol': 'cobol',
  'prolog': 'prolog',
  'apl': 'apl',
  'awk': 'awk',
  'wasm': 'wasm',
  'webassembly': 'wasm',
  'latex': 'latex',
  'tex': 'tex',
  'bash': 'bash',
  'shell': 'bash',
  'sh': 'bash',
  'powershell': 'powershell',
  'zsh': 'zsh',
  'html': 'html5',
  'html5': 'html5',
  'css': 'css3',
  'css3': 'css3',
  'sass': 'sass',
  'scss': 'sass',
  'less': 'less',
  'stylus': 'stylus',
  'postcss': 'postcss',
  'markdown': 'markdown',
  'md': 'markdown',
  'json': 'json',
  'yaml': 'yaml',
  'yml': 'yaml',
  'xml': 'xml',
  'vue': 'vuejs',
  'svelte': 'svelte',
  'astro': 'astro',
  'jsx': 'react',
  'react': 'react',
};

/// Devicon SVG logo for a language. Falls back to a first-letter tile in the
/// fallback color when the language isn't in our slug map.
class DeviconImage extends StatelessWidget {
  final String language;
  final double size;
  final Color fallbackColor;

  const DeviconImage({
    super.key,
    required this.language,
    required this.size,
    this.fallbackColor = const Color(0xFF94A3B8),
  });

  @override
  Widget build(BuildContext context) {
    final slug = _languageToSlug[language.toLowerCase().trim()];
    if (slug == null) {
      return _LetterTile(language: language, size: size, color: fallbackColor);
    }
    return SvgPicture.asset(
      'assets/lang/$slug.svg',
      width: size,
      height: size,
      placeholderBuilder: (_) =>
          _LetterTile(language: language, size: size, color: fallbackColor),
    );
  }
}

class _LetterTile extends StatelessWidget {
  final String language;
  final double size;
  final Color color;
  const _LetterTile({
    required this.language,
    required this.size,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    final letter = language.isNotEmpty ? language[0].toUpperCase() : '?';
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(size * 0.16),
      ),
      alignment: Alignment.center,
      child: Text(
        letter,
        style: TextStyle(
          color: Colors.white,
          fontSize: size * 0.5,
          fontWeight: FontWeight.w900,
          height: 1.0,
        ),
      ),
    );
  }
}
