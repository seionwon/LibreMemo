export const srt='1\n00:00:01,250 --> 00:00:03,000\n첫 번째 한국어 대사\n둘째 줄\n\n2\n00:05:12,000 --> 00:05:14,000\n두 번째 대사';
export const subtitleFixtures={
  srt,
  vtt:'WEBVTT\n\nSTYLE\n::cue { color: red; }\n\nNOTE secret\nnot a caption\n\none\n00:01.250 --> 00:03.000 align:start\n<v 강사>첫 번째 한국어 대사\n\ntwo\n05:12.000 --> 05:14.000\n두 번째 대사',
  smi:'<SAMI><HEAD><STYLE>.KRCC { Name: 한국어; lang: ko-KR; }.ENCC { Name: English; }</STYLE></HEAD><BODY><SYNC Start=1250><P Class=KRCC>첫 번째 한국어 대사<br>둘째 줄<P Class=ENCC>English line<SYNC Start=3000><P Class=KRCC>&nbsp;<SYNC Start=312000><P Class=KRCC>두 번째 대사<SYNC Start=314000><P Class=KRCC>&nbsp;</BODY></SAMI>',
  ass:'[Script Info]\nTitle: test\n[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\nDialogue: 0,0:00:01.25,0:00:03.00,Default,강사,0,0,0,,{\\b1}첫 번째 한국어 대사{\\b0}\\N둘째 줄, 쉼표 유지\nComment: 0,0:00:04.00,0:00:05.00,Default,,0,0,0,,숨긴 주석\nDialogue: 0,0:05:12.00,0:05:14.00,Default,,0,0,0,,두 번째 대사',
};
subtitleFixtures.sami=subtitleFixtures.smi;subtitleFixtures.ssa=subtitleFixtures.ass.replace('Layer,','Marked,').replaceAll('Dialogue: 0,','Dialogue: Marked=0,');
