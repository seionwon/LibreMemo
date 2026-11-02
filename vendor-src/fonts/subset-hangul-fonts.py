import subprocess,sys
hanja=set()
for a in range(0xCA,0xFE):
    for b in range(0xA1,0xFF):
        try:
            c=bytes([a,b]).decode('euc-kr');hanja.add(ord(c))
        except: pass
r=[(0x20,0x17F),(0x2010,0x2BFF),(0x3000,0x33FF),(0xAC00,0xD7A3),(0xFF00,0xFFEF),(0xFE30,0xFE4F)]
u=sorted(hanja)+[c for a,b in r for c in range(a,b+1)]
open('u.txt','w').write(','.join('U+%04X'%c for c in u))
for s,o in (('notoserifkr','LibreMemoSerif'),('notosanskr','LibreMemoSans')):
    subprocess.check_call(['./v/bin/pyftsubset',s+'.ttf','--unicodes-file=u.txt','--flavor=woff2','--output-file='+o+'.woff2','--no-hinting','--desubroutinize','--layout-features=kern,liga,ccmp,locl,vert,vrt2,halt','--name-IDs=*','--notdef-outline'])
