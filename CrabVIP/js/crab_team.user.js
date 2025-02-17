// ==UserScript==
// @name           peflteam
// @namespace      pefl
// @description    team page modification
// @include        http://*pefl.*/plug.php?p=refl&t=k&j=*
// @require			crab_funcs_db.js
// @encoding	   windows-1251
// ==/UserScript==

var type 	= 'num'
var players = []
var players2= []
var players3= []
var matches2	= []
var matchespl2	= []

/**
 * Teams(work with)
 *
 * @type {*[]}
 */
let teams = [], url = new Url();
var sumax 	= 3600
var team_cur = {}
var m = []
var sumvaluechange = 0
var save = false

// Rows from web db
const list = {
	'players':	'id,tid,num,form,morale,fchange,mchange,value,valuech,name,goals,passes,ims,rate',
	'teams':	'tid,my,did,num,tdate,tplace,ncode,nname,tname,mname,ttask,tvalue,twage,tss,avTopSumSkills,age,pnum,tfin,screit,scbud,ttown,sname,ssize,mid,tform,tmorale,tsvalue',
//	'matches':	'id,su,place,schet,pen,weather,eid,ename,emanager,ref,hash,minutes',
//	'matchespl':'id,n1,n2,n3,n4,n5,n6,n7,n8,n9,n10,n11,n12,n13,n14,n15,n16,n17,n18'
}
var skl = {}
	skl['corners']	= '�������'
	skl['crossing']	= '������'
	skl['dribbling']= '��������'
	skl['finishing']= '�����'
	skl['freekicks']= '��������'
	skl['handling']	= '���� ������'
	skl['heading']	= '���� �������'
	skl['exiting']	= '���� �� �������'
	skl['leadership']= '���������'
	skl['longshots']= '������� �����'
	skl['marking']	= '����. �����'
	skl['pace']		= '��������'
	skl['passing']	= '���� � ���'
	skl['positioning']= '����� �������'
	skl['reflexes']	= '�������'
	skl['stamina']	= '������������'
	skl['strength']	= '����'
	skl['tackling']	= '����� ����'
	skl['vision']	= '������� ����'
	skl['workrate']	= '�����������������'
	skl['technique']= '�������'

var rtasks = {
	'�����������':1,
	'����� � ������ �.':2,
	'������':3,
	'���� ������������':4,
	'���� ��':5,
	'������� � 3�':6,
	'������� � �������':7,
	'������� � �������':8,
	'15 �����':9,
	'�� ��������':10
}

const rschools = {
	'����� ������': 1,
	'������': 2,
	'�������': 3,
	'�������': 4,
	'��������': 5,
	'�������� ������': 6,
	'���� �� ������ � ����': 7
}

var sumP = 0
var sumH = false

var countSostav = 0;

/**
 * Squad counter for VIP clients
 *
 * @type {number}
 */
let countSquadVIP = 0

var countSk = [0]
var svalue = true
var nom = true
var zp  = true
var sk  = true
var age = true
var pos1 = {'C' :0}
var pos2 = {'GK':0}
var skills = {
	'N': 'pn', '���':'name', '���':'position', '���':'form', '���':'morale', '��':'sumskills', '���':'sorting',
	'���':'�������', '���':'������', '���':'��������', '���':'�����', '���':'��������', '���':'���� ������',
	'���':'���� �������', '���':'���� �� �������', '���':'���������', '���':'������� �����', '���':'����. �����',
	'���':'��������', '���':'���� � ���', '���':'����� �������', '���':'�������', '���':'������������', '���':'����',
	'���':'����� ����', '���':'������� ����', '���':'�����������������', '���':'�������'
}

/**
 * TeamId from the page
 *
 * @type {number}
 */
let cid = 0;

/**
 * Max squad counter
 *
 * @type {number}
 */
let countSquadMax = 0;

$().ready(function() {
	// �������� teamId �� �������� �������
	cid = parseInt($('td.back4 table:first table td:first').text());
	// ��������� � ������� �������, �� �������� ������� �� ������ ���������
	teams[cid] = {'tid': cid};

	if (url.l == 'y') {
		//Page for show skills
		$('table#tblRostSkillsFilter td:first').prepend('<a href="javascript:void(ShowSkillsY())">�������</a> | ')
		$('table#tblRostSkills tr:eq(0) td').each(function(){
			if(!ff){
				var onclick = (ff ? String($(this).find('a').attr('onclick')) : String($(this).find('a').attr('onclick')).split('{')[1].split('}')[0])
				var name = $(this).find('a').html()
				$(this).html('<a href="#" class="sort" onclick="'+onclick+';EditSkillsPage()">'+name+'</a>')
			}
		})
		EditSkillsPage()
	}else{
		modifyPage()
		countSquadMax  = $('tr[id^=tblRosterTr]').length;
		countRentMax 	= $('tr[id^=tblRosterRentTr]').length
		Std.debug('Main:countSquadMax=' + countSquadMax)
		EditFinance();
		GetFinish('start', true)
		if(cid==parseInt(localStorage.myteamid)) {
			delete localStorage.matches
			delete localStorage.matchespl
			getJSONlocalStorage('matches2',matches2)
			getJSONlocalStorage('matchespl2',matchespl2)
			getJSONlocalStorage('players2',players3)
		}
	}
}, false);

function GetFinish(type, res) {
	Std.debug('GetFinish:type=' + type + ':res=' + res);
	m[type] = res;

	if (m.checksu === undefined && m.pg_players && url.h !=1 ) {
		m.checksu = true
		checkDeleteMatches()
	}

	//
	if (m.getdatatm === undefined && m.start) {
		m.getdatatm = true;

		GetData('teams');
		GetInfoPageTm();
	}
	// Get players data
	if(m.getdatapl === undefined && m.pg_teams){
		m.getdatapl = true;

		GetData('players');
		GetInfoPagePl();
	}
	//
	if (m.modifyteams === undefined && m.get_teams !== undefined && m.pg_teams && m.pg_players) {
		m.modifyteams = true

		ModifyTeams();	//and save if need
		PrintRightInfo()
	}
	if(m.savedatapl === undefined && m.get_players==false && m.pg_players){
		m.savedatapl = true
		SaveData('players')
		saveJSONlocalStorage('players2',players3)
	}
	if(m.savedatapl === undefined && m.get_players && m.pg_players) {//m.trash
		m.savedatapl = true
		ModifyPlayers()// and Save if need
	}
	if(m.showvip === undefined) {
		m.showvip = true
		RelocateGetNomData() // ������ getnomdata=true
	}
	// Print rightInfo block into team page
	if (m.rightvip === undefined && m.getnomdata && m.pg_playersVip) {
		m.rightvip = true;

		CheckTrash();
		ModifyTeams();	//and save if need
		PrintRightInfoVip();
		ModifyPlayers('vip'); // and Save if need
	}
}

function modifyPage() {
	// ���������� ������
	drawEars();
	$('body table.border:has(td.back4)').appendTo( $('td#crabglobalcenter') );

	preparedhtml  =	'<table width=100% id="rg"><tr><th colspan=3>���������� ���������</th></tr>'
	preparedhtml += '<tr><td id="finance1"></td><td id="finance2" colspan=2></td></tr>'
	preparedhtml += '<tr><td id="os" colspan=3 align=center nowrap><br><b>�������� ������</b>'
	preparedhtml += (url.h == 1 ? '' : ' <a id=showvip href="javascript:void(ShowVip())">(��)</a>')
	preparedhtml += '</td></tr>'

	// Average form
	preparedhtml += '<tr id="osform">'
	preparedhtml += '<td nowrap><b>�����</b>'+('&nbsp;(���)').fontsize(1)+'<b>:</b></td>'
	preparedhtml += '<th id=osform align=right nowrap></th>'
	preparedhtml += '</tr>'

	// Average morale
	preparedhtml += '<tr id="osmorale">'
	preparedhtml += '<td nowrap><b>������</b>'+('&nbsp;(���)').fontsize(1)+'<b>:</b></td>'
	preparedhtml += '<th id=osmorale align=right nowrap></th>'
	preparedhtml += '</tr>'

	// Average age
	preparedhtml += '<tr id="osage">'
	preparedhtml += '<td nowrap><b><a href="javascript:void(ShowPlayersAge())">�������</a></b>'+('&nbsp;(���)').fontsize(1)+'<b>:</b></td>'
	preparedhtml += '<th id="osage" align=right nowrap></th>'
	preparedhtml += '</tr>'

	// Average skills(all)
	preparedhtml += '<tr id="osskills">'
	preparedhtml += '<td nowrap><b><a href="javascript:void(ShowPlayersSkillChange())">������</a></b>'+('&nbsp;(���)').fontsize(1)+'<b>:</b></td>'
	preparedhtml += '<th id="osskills" align=right nowrap></th>'
	preparedhtml += '</tr>'

	// Average skills(all)
	preparedhtml += '<tr id="osSkills16">'
	preparedhtml += '<td nowrap><b>������16</b>'+('&nbsp;(���)').fontsize(1)+'<b>:</b></td>'
	preparedhtml += '<th id="osSkills16_th" align=right nowrap></th>'
	preparedhtml += '<td width=10%>&nbsp;<a href="#" onClick="alert(\'������� ����� �� 16 ������ ������� � �������(11 + 5)\')">?</a></td>'
	preparedhtml += '</tr>'

	// Face value+
	preparedhtml += '<tr id="ossvalue">'
	preparedhtml += '<th align=left width=50% nowrap><a href="javascript:void(ShowPlayersSValue())">��������+</a>:</th>'
	preparedhtml += '<th id=ossvalue align=right nowrap></th>'
	preparedhtml += '<td width=10%>&nbsp;<a href="#" onClick="alert(\'������������� �������� �������� � ������� ������ ������ ����������� �� �� ������� ������ ��������� (�������, �������, �������, ��������� �����)\')">?</a></td>'
	preparedhtml += '</tr>'

	// Face value
	preparedhtml += '<tr id="osnom">'
	preparedhtml += '<th align=left width=50% nowrap><a id="osnom" href="javascript:void(ShowPlayersValue())">��������</a>:</th>'
	preparedhtml += '<th id=osnom nowrap align=right></th>'
	preparedhtml += '<td id=nomch nowrap width=10%>&nbsp;</td>'
	preparedhtml += '</tr>'

	// Wage
	preparedhtml += '<tr id="oszp">'
	preparedhtml += '<th align=left nowrap><a href="javascript:void(ShowPlayersZp())">��������</a>:</th>'
	preparedhtml += '<th id="oszp" align=right nowrap></th>'
	preparedhtml += '</tr>'

	preparedhtml += '</table><br>'
	preparedhtml += '<br>'
	preparedhtml += '<a href="javascript:void(ShowRoster())"><b>������ �������</b></a><br>'
	preparedhtml += '<b><a id=teamskills>������ �������</a></b>'
	preparedhtml += '<br><a id=teamsu href="javascript:void(ShowSU())" style="display: none;"><b>��������������</b></a>'
	preparedhtml += '<br><br>'
	$("#crabright").html(preparedhtml)

	// add tables
	var filter = '<div id="divRostSkillsFilter" style="display: none;"><a href="javascript:void(ShowSkills(2))">�������</a> | <a href="javascript:void(ShowFilter())">������ >></a></div>'
	filter += '<table id="tblRostSkillsFilter" width=50% align=left cellspacing=1 cellpadding=1 class=back1 border=0 style="display: none;">'
	filter += '<tr align=center><th width=10%></th><th id="R" width=15%><a href="javascript:void(Filter(1,\'R\'))">R</a></th><th width=15%></th><th id="C" width=15%><a href="javascript:void(Filter(1,\'C\'))">C</a></th><th width=15%></th><th id="L" width=15%><a href="javascript:void(Filter(1,\'L\'))">L</a></th></tr>'
	filter += '<tr align=center><th id="GK"><a href="javascript:void(Filter(2,\'GK\'))">GK</a></th><th></th><th></th>	<td class=back2 id="GK">&nbsp;</td>		<th></th>	<th></th></tr>'
	filter += '<tr align=center><th id="SW"><a href="javascript:void(Filter(2,\'SW\'))">SW</a></th><th></th><th></th>	<td class=back2 id="C SW">&nbsp;</td>	<th></th>	<th></th></tr>'
	filter += '<tr align=center><th id="DF"><a href="javascript:void(Filter(2,\'DF\'))">DF</a></th><td class=back2 id="R DF">&nbsp;</td>	<td class=back2 id="C DF">&nbsp;</td>	<td class=back2 id="C DF">&nbsp;</td>	<td class=back2 id="C DF">&nbsp;</td>	<td class=back2 id="L DF">&nbsp;</td></tr>'
	filter += '<tr align=center><th id="DM"><a href="javascript:void(Filter(2,\'DM\'))">DM</a></th><td class=back2 id="R DM">&nbsp;</td>	<td class=back2 id="C DM">&nbsp;</td>	<td class=back2 id="C DM">&nbsp;</td>	<td class=back2 id="C DM">&nbsp;</td>	<td class=back2 id="L DM">&nbsp;</td></tr>'
	filter += '<tr align=center><th id="MF"><a href="javascript:void(Filter(2,\'MF\'))">MF</a></th><td class=back2 id="R MF">&nbsp;</td>	<td class=back2 id="C MF">&nbsp;</td>	<td class=back2 id="C MF">&nbsp;</td>	<td class=back2 id="C MF">&nbsp;</td>	<td class=back2 id="L MF">&nbsp;</td></tr>'
	filter += '<tr align=center><th id="AM"><a href="javascript:void(Filter(2,\'AM\'))">AM</a></th><td class=back2 id="R AM">&nbsp;</td>	<td class=back2 id="C AM">&nbsp;</td>	<td class=back2 id="C AM">&nbsp;</td>	<td class=back2 id="C AM">&nbsp;</td>	<td class=back2 id="L AM">&nbsp;</td></tr>'
	filter += '<tr align=center><th id="FW"><a href="javascript:void(Filter(2,\'FW\'))">FW</a></th><th></td><td class=back2 id="C FW">&nbsp;</td>	<td class=back2 id="C FW">&nbsp;</td>	<td class=back2 id="C FW">&nbsp;</td>	<th></th></tr>'
	filter += '</table>'
	filter += '<table id="SumPl" width=50% align=right style="display: none;">'
	filter += '<tr id="sumhead"><th colspan=4 align=center id="sumhead">��������� �����</th></tr>'
	filter += '<tr id="sumlast1"><td colspan=4 align=right id="sumlast1"><a href="javascript:void(ShowSumPlayer(0))">�����</a>, <a href="javascript:void(ShowSumPlayer(1))">�������</a>, <a href="javascript:void(ShowSumPlayer(2))">�����</a></td></tr>'
	//filter += '<tr id="sumlast2"><td colspan=4 align=right id="sumlast2"><a href="javascript:void(ShowHols())">�������</a></td></tr>'
	filter += '</table>'
	filter += '<div id="filter" style="display: none;">&nbsp;</div>'
	$('table#tblRosterFilter').after(filter)

	preparedhtml  = '<table id="tblRostSkills" width=866 class=back1 style="display: none;">' //BFDEB3
	preparedhtml += '</table>'
	preparedhtml += '<div id="divRostSkills" style="display: none;">'
	preparedhtml += '<br>* - <i>������ �� �������� <b>���</b> ����� ��������� ��� �������� ����� ������� ������������� ������</i>'
	preparedhtml += '<br>* - <i>�������� �� ��������� �������� ���� ����������� �� ����� ���������� �������</i></div><br>'
	$('table#tblRoster').after(preparedhtml)
}

function RelocateGetNomData(arch){
	Std.debug('RelocateGetNomData('+arch+')')
	if(arch==undefined) arch = '';
	if(localStorage.getnomdata != undefined && String(localStorage.getnomdata).indexOf('1.1$')!=-1){
		Std.debug('Storage.getnomdata ok!')
		//GetNomData(0)
		GetFinish('getnomdata', true)
	}else{
		var top = (localStorage.datatop != undefined ? localStorage.datatop : 9885110) //9107893
		Std.debug('Storage.getnomdata('+top+')')
		var url_top = 'm=posts'+arch+'&p='+top

		if($('#debval').length==0) $('td.back4').prepend('<div style="display: none;" id=debval></div>') 
		$('div#debval').load('forums.php?'+url_top+' td.back3:contains(#CrabNom1.1.'+top+'#) blockquote pre', function(){
			if($('#debval').html()=='' && arch==''){
				RelocateGetNomData('&arch=1')
			}else{
				$('div#debval').find('hr').remove()
				var data = $('#debval pre').html().split('#').map(function(val,i){
					return val.split('<br>').map(function(val2,i2){
						return $.grep(val2.split('	'),function(num, index) {return !isNaN(index)})
					})
				})
				var text = ''
				var nm = []
				for (i in data){
					var x = []
					for(j in data[i]) x[j] = data[i][j].join('!')
					nm[i] = x.join('|')
				}
				text = nm.join('#')
				localStorage.getnomdata ='1.1$'+text.replace('Code','')
				//GetNomData(0)
				GetFinish('getnomdata', true)
			}
		})
	}
}

function GetNomData(id){
//	Std.debug('GetNomData:id='+id)
	var sdata = []
	var pl = players[id]
	var tkp = 0
	var fp = {}
	var svalue = 0
	var kpkof = 1.1
	var plnom = []
	nm = String(localStorage.getnomdata).split('$')[1].split('#')
	for (i in nm){
		sdata[i] = []
		x = nm[i].split('|')
		for (j in x){
			sdata[i][j] = x[j].split('!')
		}
	}
	kpkof = parseFloat(sdata[0][0][0])
	//Std.debug('GetNomData:pl:'+pl.value+':'+pl.age)

	var saleAge = 0
	var ages = (sdata[0][0][1]+',100').split(',')
	for(i in ages) 	if(pl.age<ages[i]) 	{saleAge = i;break;}
	//Std.debug('SaleAge:'+saleAge+':'+ages[saleAge])

	var saleValue = 0
	var vals = ('0,'+sdata[0][0][2]+',100000').split(',')
	for(i in vals) 	if(pl.value<vals[i]*1000)	{saleValue = i-1;break;}
	//Std.debug('SaleValue:'+saleValue+':'+vals[saleValue])

	//Std.debug('���:'+sdata[0][saleValue+1][0])
	fp.av = parseFloat(sdata[0][saleValue+1][0])
	fp.mn = parseFloat(sdata[0][saleValue+1][1])
	fp.mx = parseFloat(sdata[0][saleValue+1][2])
	var saleNom = ''
	var t = 0
	for(i=1;i<sdata.length;i++){
		for(n in sdata[i]){
			if(isNaN(parseInt(sdata[i][n][0])) && Std.trim(sdata[i][n][0])!=''){
				t++
				plnom[t] = {psum:0,tkp:sdata[i][saleValue][saleAge]}

				var pos1 = (sdata[i][n][0].split(' ')[1]!=undefined ? sdata[i][n][0].split(' ')[0] : '')
				if(pos1=='') plnom[t].pos1 = true
				else for(h in pos1) if(pl.position.indexOf(pos1[h])!=-1) plnom[t].pos1 = true

				var pos2 = (sdata[i][n][0].split(' ')[1]==undefined ? Std.trim(sdata[i][n][0].split(' ')[0]) : sdata[i][n][0].split(' ')[1]).split('/')
				for(h in pos2) if(pl.position.indexOf(pos2[h])!=-1) plnom[t].pos2 = true

				if(plnom[t].pos1 && plnom[t].pos2){
					plnom[t].psum = 1
					plnom[t].id = t
					plnom[t].pos = sdata[i][n][0]
					var count = 0
					for(j=1;j<sdata[i][n].length;j++) {
						var kof = parseFloat(sdata[i][n][j].split('-')[0])
						//var skl = parseInt(pl[skl[sdata[i][n][j].split('-')[1]]])
						var skil = parseInt(pl[skl[sdata[i][n][j].split('-')[1]]])
						if(!isNaN(skil)){
							plnom[t].psum = plnom[t].psum*Math.pow((skil<1 ? 1 : skil) ,kof)
							count += kof
						}
						//Std.debug(skil+'^'+kof+':'+sdata[i][n][j].split('-')[1])
					}
					plnom[t].psum = Math.pow(plnom[t].psum,1/count)
					//Std.debug(plnom[t].id+':'+plnom[t].pos+':'+(plnom[t].psum).toFixed(2)+':'+plnom[t].tkp)
				}else{
					//Std.debug('----- no ----'+sdata[i][n][0])
				}
			}
		}
	}
	plnom = plnom.sort(sNomPsum)
	fp.res = plnom[0].psum/fp.av
	fp.res = (fp.res<fp.mn ? fp.mn : (fp.res > fp.mx ? fp.mx : fp.res))
	tkp = plnom[0].tkp/100
	//for (i=0;i<2;i++) Std.debug('psum'+plnom[i].id+':'+(plnom[i].psum).toFixed(2))
	//Std.debug('��:'+(plnom[0].psum/plnom[1].psum).toFixed(3) + ' < '+kpkof)
	if(plnom[1].psum!=0 && ((plnom[0].psum/plnom[1].psum)<kpkof)) {
		tkp = Math.max(plnom[0].tkp,plnom[1].tkp)/100
	}
	//for (i=0;i<2;i++) Std.debug('tkp:'+plnom[i].tkp)
	svalue = parseInt(pl.value*tkp*fp.res/1000)
	svalue = (svalue == 0 ? 1 : svalue)
	//Std.debug('��='+(pl.value/1000)+'*'+tkp+'*'+(fp.res).toFixed(3)+'='+svalue)
	//$('div#SValue').html('~<font size=2>'+ShowValueFormat(svalue)+'</font>')
	return svalue*1000
}

function sNomPsum(i, ii) { // ����������
    if 		(i.psum < ii.psum)	return  1
    else if	(i.psum > ii.psum)	return -1
    else					return  0
}

function ShowSU(del) {
	Std.debug('ShowSU:del='+del)
	if(del) {
		$('table#tblSu, table#tblSuM, div#divSu').remove()
//		plsu.splice(0,100000)
		plsu = []
//		Std.debug('ShowSU:plsu.length:'+plsu.length)
	}
//	for(g in matches2) Std.debug('g='+g+':mid='+matches2[g].id)
	$('div#divRostSkillsFilter').hide()
	$('table#tblRostSkillsFilter').hide()
	$('table#SumPl').hide()
	$('table#tblRostSkills').hide()
	$('div#divRostSkills').hide()
	$('div#filter').hide()

	$('table#tblRosterFilter').hide()
	$('table#tblRoster').hide()

//	Std.debug('ShowSU:������(tblSu)='+$('table#tblSu').length)
	if($('table#tblSu').length>0) {
		$('table#tblSu').show()
		$('table#tblSuM').show()
		$('div#divSu').show()
	}else{
		var plsu = []
		var plexl = String(localStorage.plexl)
		var teamminutes = 0
		for(i in matchespl2){
			var num = plsu.length
			plsu[num] = {'name':i, 'minutesu':0,'minute':0,'matches':0,'matches2':0,'del':(plexl.indexOf('|'+i+'|') != -1 ? true : false)}
			for (j in matchespl2[i]){
				var mth = matchespl2[i][j]
				var mch2 = {}
				for(g in matches2){
					if(matches2[g]!=null && matches2[g]!=undefined && parseInt(matches2[g].id)==parseInt(j)) {
						mch2 = matches2[g];
						break
					}
				}
				var countminutes = (mth.h==undefined && (mch2.hnm==undefined || mch2.anm==undefined) ? true : false)
				var minute = 0
				if(mth.mr!=undefined){
					//����� � ����� ��� ���� ��� ������ ����.
					if(mth.m==undefined){
						minute = parseInt(mch2.m)
						if(minute>119) minute=120
						else if(minute>89) minute=90
					}else{
						minute = (mth['in']==1 ? parseInt(mth.m)+5+90-parseInt(mch2.m) : parseInt(mth.m)+5)
					}
					plsu[num].matches2 	+= 1
					if(countminutes) {
						//��������� �� ������ �������� ������ ��� ������� �����
						plsu[num].minute 	+= minute
					}
					if(mch2.su==undefined && mth.h!=1){
						// ���� �������������� �������� � �����, �� ��������� ������
						plsu[num].minutesu	+= minute
						plsu[num].matches 	+= 1
					}
				}
                if(!plsu[num].del && countminutes) teamminutes += minute
//				Std.debug('ShowSU:'+i+':minute='+minute+':teamminutes='+teamminutes+':mch2='+mch2.id)
			}
		}
		var teamm = 0
		for(i in matches2) {
			Std.debug('ShowSU:h='+matches2[i].h+':hnm'+matches2[i].hnm+':anm='+matches2[i].anm)
			if(matches2[i].h!=undefined && (matches2[i].hnm==undefined || matches2[i].anm==undefined)){
				teamm += parseInt(matches2[i].m)
				Std.debug('ShowSU:teamm='+teamm)
			}
		}
//		Std.debug('ShowSU:teamm='+teamm)
		for(i in plsu) {
			plsu[i].tilda = (plsu[i].del ? 'none' : parseFloat(plsu[i].minute/(teamminutes/countSquadMax)*100))
			plsu[i].tilda2 = (plsu[i].del ? 'none' : parseInt(plsu[i].minute-(teamminutes/countSquadMax*40/100)))
			//Std.debug('ShowSU:'+i+':'+plsu[i].minute+':'+teamminutes+':'+countSquadMax)
		}

		var preparedhtml = '<table id="tblSu" class=back1 width=100%>' //BFDEB3
		preparedhtml += '<tr align=left>'
		preparedhtml += '<td></td>'
		preparedhtml += '<th>N</th>'
		preparedhtml += '<th nowrap>~(%)</th>'
		preparedhtml += '<th nowrap>~(���)</th>'
//		if(deb) preparedhtml += '<th nowrap>%(2)</th>'
		preparedhtml += '<th>���</th>'
		preparedhtml += '<th>��: �����</th>'
		preparedhtml += '<th>������</th>'
		preparedhtml += '<th>��������</th>'
		preparedhtml += '</tr>'
		var pls = plsu.sort(function(a,b){return (((b.del ? -10000 : 0) + b.minutesu + b.minute*0.001) - ((a.del ? -10000 : 0) + a.minutesu + a.minute*0.001))})
		var num = 1
		for(i in pls) {
			var plsi = pls[i]
			var ost = sumax - plsi.minutesu
			var ostmatch = Math.floor(ost/90)
			var ostminute = ost - ostmatch*90
			var trclass = (plsi.del ? ' bgcolor='+(num%2==1 ? 'BABDB6' : 'D3D7CF') : ' class=back'+(num%2==1 ? 2 : 1))
			preparedhtml += '<tr'+trclass+'>'
			preparedhtml += '<td align=center width=1%><a href="javascript:void(DeletePl(\''+plsi.name+'\','+plsi.del+'))"><font color=red>X</font></a></td>'
			preparedhtml += '<td>'+(parseInt(i)+1)+'</td>'
			preparedhtml += '<td align=right width=5%'+(plsi.tilda!='none' && plsi.tilda<=40 ? ' bgcolor=yellow' : '')+'><a href="javascript:void(suMarkDel(\''+plsi.name+'\','+plsi.del+'))">'+(plsi.tilda=='none' ? '&nbsp;&nbsp;&nbsp;' : (plsi.tilda).toFixed(1)) +'</a></td>'
			preparedhtml += '<td align=right width=5%'+(plsi.tilda2!='none' && plsi.tilda2<=0 ? ' bgcolor=yellow' : '')+'><a href="javascript:void(suMarkDel(\''+plsi.name+'\','+plsi.del+'))">'+(plsi.tilda2=='none' ? '&nbsp;&nbsp;&nbsp;' : plsi.tilda2) +'</a></td>'
//			if(deb) preparedhtml += '<td align=right width=5%'+(plsi.tilda2!='none' && plsi.tilda2<=40 && teamm!=0? ' bgcolor=yellow' : '')+'><a href="javascript:void(suMarkDel(\''+plsi.name+'\','+plsi.del+'))">'+(plsi.tilda2=='none' ? '&nbsp;&nbsp;&nbsp;' : (plsi.tilda2).toFixed(1)) +'</a></td>'
			preparedhtml += '<td><a href="javascript:void(ShowPlM(\''+plsi.name+'\','+plsi.del+'))"><b>'+plsi.name+'</b></a></td>'
			preparedhtml += '<td><b>'+plsi.minutesu+'</b>'+(plsi.minute>0 ? '<font size=1> ('+plsi.minute+')</font>' : '')+'</td>'
			preparedhtml += '<td><b>'+plsi.matches+'</b>'+(plsi.matches2>0 ? '<font size=1> ('+plsi.matches2+')</font>' : '')+'</td>'
			preparedhtml += '<td><b>'+ost+'</b>'
			preparedhtml += (ost>0 ? '<font size=1> ('+(ostmatch>0 ? '90*'+ostmatch+' + ' : '')+ostminute+')</font>' : '')
			preparedhtml += '</td>'
			preparedhtml += '</tr>'
			num++
		}
		preparedhtml += '</table>'
		preparedhtml += '<div id="divSu">'
		preparedhtml += '<br>1. � �������������� ����� ���� ��������'
		preparedhtml += '<br>2. ������ ������ ���� �������� ������ � ��������(~)'
		preparedhtml += '<br>3. ����� �������� �� ��� �� ���� � ������� % �����'
		preparedhtml += '<br>4. <a>&ndash;</a> ���� ������ ��������� ��� �������� % ����� (�������� ��� ������������ ���������)'
		preparedhtml += '<br>5. <font color=red>X</font> �������: ������, ������ �� ����� ��� ���� �������'
		preparedhtml += '<br>6. ������� �� ��� ������ ����� ���������� � ����� ������ � ������� �� �����'
		preparedhtml += '<br>7. ��� ����������� ��� � �������� ������� � ���������'
		preparedhtml += '<br>8. ���������� ������ ���� ���: ������� ����� ��� ���(�� id), ����� �� �����'

		preparedhtml += '</div><br><br>'

		preparedhtml += '<table id="tblSuM" width=100% style="border-spacing:1px 0px"></table>'

		$('table#tblRoster').after(preparedhtml)
//		$('table#tblSu tr:even').attr('class','back2')
//		$('table#tblSu tr:odd').attr('class','back1')
	}
	ShowPlM(0)
}

function suMarkDel(plid,del){
	Std.debug('suMarkDel:'+localStorage.plexl)
	Std.debug('suMarkDel:plid='+plid+':del='+del+':'+(del ? '�������':'���������'))
	if(del) localStorage.plexl = String(localStorage.plexl).replace(plid+'|','')
	else	localStorage.plexl = (String(localStorage.plexl)=='undefined' ? '|' : String(localStorage.plexl)) + plid+'|'
	Std.debug('suMarkDel:'+localStorage.plexl)
	ShowSU(true)
	ShowPlM(plid)
}

function ShowPlM(plid,pdel){
	Std.debug('ShowPlM:plid='+plid+':pdel='+pdel)
	var matchpos = [,'GK',,
	,,'SW',,,
	'R DF','C DF','C DF','C DF','L DF',
	'R DM','C DM','C DM','C DM','L DM',
	'R M','C M','C M','C M','L M',
	'R AM','C AM','C AM','C AM','L AM',
	,'FW','FW','FW',,
	,'FW','FW','FW',,
	'L AM','C AM','C AM','C AM','R AM',
	'L M','C M','C M','C M','R M',
	'L DM','C DM','C DM','C DM','R DM',
	'L DF','C DF','C DF','C DF','R DF',
	,,'SW',,,
	,'GK']

	$('table#tblSuM tr').remove()
	pdel = (pdel==undefined ? false : pdel)

	var plcount = 0
	var plname = (plid==0 ? '&nbsp;' : plid)
	var plinfo = '<br>&nbsp;'
	var plposition = false
	if(plid!=0) for(m in players) {
//		Std.debug('ShowPlM:'+String(players[m].name)[0]+'=='+plid.split('.')[0]+':'+players[m].name+'=='+plid.split('.')[1])
		if(	String(players[m].name)[0]==(plid.split('.')[1]==undefined ? plid[0] : plid.split('.')[0]) && 
			players[m].name.indexOf((plid.split('.')[1]==undefined ? plid : plid.split('.')[1]))!=-1)
		{
			plcount++
			if(plcount==1){
				plposition = players[m].position
				plname = players[m].name +'('+plposition+')'
				plinfo  = '<br><img src="system/img/flags/'+players[m].nid+'.gif" width=20></img> '
				plinfo += '�������: '+players[m].age+', �������: '+ShowValueFormat(players[m].value/1000)+'�'
				plinfo += ', �����/������: '+players[m].form+'/'+players[m].morale
			}
			if(plcount>1){
				plname = plid
				plinfo = ''
				plposition = false
			}
		}
	}
	
	var prehtml = ''
	prehtml += '<tr>'
	prehtml += '<td colspan='+(plid!=0 ? '17 style="border-bottom:1px solid;"' : '7')+'><font size=3><b>'+plname+'</b></font>'+plinfo+'</td>'
	prehtml += (plid==0 ? '<td colspan=10 style="border-bottom:1px solid;">&nbsp;</td>' : '')
	prehtml += '</tr>'
	prehtml += '<tr id=zagolovok height=20>'
	if(plid!=0){
		prehtml += '<td style="border-left:1px solid;">&nbsp;</td>'
		prehtml += '<td></td>'
		prehtml += '<td>&nbsp;N</td>'
		prehtml += '<td>���</td>'
		prehtml += '<td>���</td>'
		prehtml += '<td>����</td>'
		prehtml += '<td>����</td>'
		prehtml += '<td style="border-right:1px solid;">&nbsp;</td>'
	}else prehtml += '<td colspan=7 class=back1></td>'
	prehtml += '<td style="border-left:1px solid;">&nbsp;</td>'
	prehtml += '<td>N</td>'
	prehtml += '<td>����</td>'
	prehtml += '<td>��</td>'
	prehtml += '<td>&nbsp;</td>'
	prehtml += '<td colspan=3 align=center>����</td>'
	prehtml += '<td style="border-right:1px solid;">������</td>'
	prehtml += '</tr>'
	prehtml += '<tr>'
	prehtml += '<td colspan=7 class=back1'+(plid!=0 ? ' style="border-top:1px solid;"' : '')+'>&nbsp;</td>'
	prehtml += '<td colspan=10 width=65% class=back1 style="border-top:1px solid;">&nbsp;</td>'
	prehtml += '</tr>'
	$('table#tblSuM').html(prehtml)

	var num = 1
	var num2 = 0
	var matches22 = []
	matches22 = matches2
	matches22.sort(function(a,b){if(a!=null&&b!=null) return (((a.dt==undefined?(a.hnm!=undefined&&a.anm!=undefined?0:100000000):a.dt) + a.id*0.0000001) - ((b.dt==undefined?(b.hnm!=undefined&&b.anm!=undefined?0:100000000):b.dt) + b.id*0.0000001))})
	for(j in matches22){
		prehtml = ''
		var mch = matches22[j]
		if(mch!=null && mch!=undefined && mch.res!=undefined){

		var mchpl	= (matchespl2[plid]!=undefined && matchespl2[plid][mch.id]!=undefined ? matchespl2[plid][mch.id] : false)
		if(mchpl.mr==undefined && mch.hnm!=undefined && mch.anm!=undefined){

		}else{
		var t1 	= (mch.hnm==undefined ? '<b>'+team_cur.tname+'</b>' : mch.hnm)
		var t2 	= (mch.anm==undefined ? '<b>'+team_cur.tname+'</b>' : mch.anm)
		var t1u = ''
		var t2u = ''
		if(mch.ust!=undefined){
			var ust = mch.ust.split('.')
			t1u = (ust[1]==undefined || ust[1]=='h' ? (ust[0]=='p' ? '(���)' : '(���)' ).fontcolor('red') : '') //p.h a.h p
			t2u = (ust[1]==undefined || ust[1]=='a' ? (ust[0]=='p' ? '(���)' : '(���)' ).fontcolor('red') : '') //p.a a.a p
		}
		var date = '&nbsp;'
		if(mch.dt!=undefined){
			var dt = new Date(mch.dt*100000)
			mdate = parseInt(dt.getDate())
			mmonth = parseInt(dt.getMonth())+1
			date =  (mdate<10?'0':'')+mdate+'.'+(mmonth<10?0:'')+mmonth//+ '.'+dt.getFullYear()
		}
		var type	= '&nbsp;'
		if(mch.tp!=undefined){
			switch(mch.tp){
				case 't': type='������������';break;
				case 'ch': type='���������';break;
//				case 'cp': type='�����';break;
				default: type = mch.tp
			}
		}
		var minute	= '&nbsp;'
		var mark	= '&nbsp;'
		var im		= false
		var cp		= ''
		var goals	= '&nbsp;'
		var cards	= '&nbsp;'
		var inz		= '&nbsp;'
		var pos		= ''
		if(plid!=0 && mchpl && mchpl.mr!=undefined){
			minute	= (mchpl.m==undefined ? mch.m : mchpl.m)
			mark	= (mchpl.mr!=undefined ? mchpl.mr : '&nbsp;')
			im		= (mchpl.im!=undefined ? true : false)
			cp		= (mchpl.cp!=undefined ? '���&nbsp;' : '')
			goals	= (mchpl.g!=undefined ? '<img src="system/img/refl/ball.gif" width=10></img>'+(mchpl.g==2 ? '<img src="system/img/refl/ball.gif" width=10></img>' : (mchpl.g>2 ? '('+mchpl.g+')' : '')) : '&nbsp;')
			cards	= (mchpl.cr!=undefined ? '<img src="system/img/gm/'+mchpl.cr+'.gif"></img>' : '&nbsp;')
			cards	= cards + (mchpl.t==1 ? '&nbsp;<img src="system/img/refl/krest.gif" width=10></img>':'')
			inz		= (mchpl['in']!=undefined ? '<img src="system/img/gm/in.gif"></img>' : (minute<mch.m ? '<img src="system/img/gm/out.gif"></img>':'&nbsp;'))
			if(mchpl.ps!=undefined){
				var posarr = String(mchpl.ps).split(':')
				for(n in posarr){
					var posname = matchpos[parseInt(posarr[n])]
					var red1 = ''
					var red2 = ''
					if(plposition && !filterPosition(plposition,posname)){
						red1 = '<font color=red>'
						red2 = '</font>'
					}
					pos	+= (pos==''?'':',')+red1+posname+red2
				}
			}else pos = '&nbsp;'
			minute	= minute +'\''
			num2++
		}
		var countmatch = (mch.hnm!=undefined && mch.anm!=undefined ? false : true)
		var trcolor = ''
		if(!countmatch) trcolor = ' bgcolor='+(num%2==1 ? 'BABDB6' : 'D3D7CF')
		else trcolor = ' class=back'+(num%2==1 ? 2 : 1)
		var tdcolor = ''
		if(pdel || mchpl.h!=undefined) tdcolor = ' bgcolor='+(num%2==1 ? 'BABDB6' : 'D3D7CF')

		prehtml += '<tr'+trcolor+' id="tr'+mch.id+'">'
		if(plid!=0){
			prehtml += '<td'+tdcolor+' width=1% style="border-left:1px solid;">'+(minute!='&nbsp;' ? '<a href="javascript:void(MinutesPl('+mch.id+',\''+plid+'\',\'del\'))"><font color=red>X</font></a>' : '&nbsp;')+'</td>'
			prehtml += '<td'+tdcolor+' width=1%>'+(minute!='&nbsp;' && mchpl.h==undefined && countmatch ? '<a href="javascript:void(MinutesPl('+mch.id+',\''+plid+'\',\'hide\'))">&ndash;</a>' : '&nbsp;')+'</td>'
			prehtml += '<td'+tdcolor+' align=right>'+(minute!='&nbsp;' ? '<b>'+String(num2).fontsize(1)+'</b>' : '&nbsp;')+'</td>'
			prehtml += '<td'+tdcolor+' nowrap align=right>'+inz+minute+'</td>'
			prehtml += '<td'+tdcolor+' nowrap>'+pos+'</td>'
			prehtml += '<td'+tdcolor+' align=right>'+(im ? '<b>' : '')+mark+(im ? '</b>' : '')+'</td>'
			prehtml += '<td'+tdcolor+' nowrap>'+goals+'</td>'
			prehtml += '<td'+tdcolor+' nowrap style="border-right:1px solid;" align=left width=5%>'+cp+cards+'</td>'
		}else prehtml += '<td colspan=7 class=back1></td>'
		prehtml += '<td style="border-left:1px solid;"><a href="javascript:void(SuDelMatch(\''+mch.id+'\',\'del\',\''+plid+'\'))"><font color=red>X</font></a></td>'
		prehtml += '<td align=right><b>'+String(num).fontsize(1)+'</b></td>'
		prehtml += '<td nowrap align=right>'+date.fontsize(1)+'</td>'
		prehtml += '<th id="tdsu'+mch.id+'">'+(mch.su==undefined ? '<a href="javascript:void(SuDelMatch(\''+mch.id+'\',\'suoff\',\''+plid+'\'))"><img src="system/img/g/tick.gif" height=12></img></a>' : '<a href="javascript:void(SuDelMatch(\''+mch.id+'\',\'suon\',\''+plid+'\'))">&nbsp;&nbsp;&nbsp;</a>')+'</th>'
//		prehtml += '<td>'+mch.m+'\'</td>'
		prehtml += '<td valign=center nowrap><img height=15 src="/system/img/w'+(mch.w!=undefined ? mch.w : 0)+'.png"></img>'+(mch.n!=undefined ? '<sup>N</sup>' : '&nbsp;')+'</td>'
		prehtml += '<td align=right nowrap>'+t1+t1u+'</td>'
		prehtml += '<td nowrap align=center>'+(mch.h!=undefined ? '<a href="plug.php?p=refl&t=if&j='+mch.id+'&z='+mch.h+'">':'')+mch.res+(mch.h!=undefined?'</a>':'')+(mch.pen!=undefined ? '(�'+mch.pen+')' : '')+'</td>'
		prehtml += '<td nowrap>'+t2+t2u+'</td>'
		prehtml += '<td nowrap style="border-right:1px solid;">'+type.fontsize(1)+'</td>'
//		prehtml += '<td nowrap style="border-right:1px solid;">'+(mch.r!=undefined ? mch.r.split(' (')[0] : '&nbsp;')+'</td>'
		prehtml += '</tr>'
		num++
		$('table#tblSuM tr#zagolovok').after(prehtml)
		}
		}
	}
}
function filterPosition(plpos,flpos){
		var pos = flpos.split(' ')
		var	pos0 = false
		var pos1 = false
		if(pos[1]==undefined) {
			pos1 = true
			if(plpos.indexOf(pos[0]) != -1) pos0 = true
		}else{
			for(k=0;k<3;k++) if(plpos.indexOf(pos[0][k]) != -1) pos0 = true
			pos1arr = pos[1].split('/')
			for(k in pos1arr) if((plpos.indexOf(pos1arr[k]) != -1)) pos1 = true
		}
		return (pos0 && pos1 ? true : false)
}

function DeletePl(pid,del){
	Std.debug('DeletePl:pid='+pid+':del='+del)
	delete matchespl2[pid]
	saveJSONlocalStorage('matchespl2',matchespl2)
	if(del) localStorage.plexl = String(localStorage.plexl).replace(pid+'|','')
	ShowSU(true)
	ShowPlM(0)
}

function MinutesPl(mid,pid,type){
	Std.debug('MinutesPl:mid='+mid+':pid='+pid+':type='+type)
	if(type=='del'){
		delete matchespl2[pid][mid]
		saveJSONlocalStorage('matchespl2',matchespl2)
		var delmatch = true
		for(i in matchespl2) if(matchespl2[i][mid]!=undefined) {
			delmatch = false;
			break;
		}
		if(delmatch){
			for(k in matches2) if(matches2[k].id==mid){
				delete matches2[k]
				break
			}
			saveJSONlocalStorage('matches2',matches2)
		}
	}
	else if(type=='hide'){
		matchespl2[pid][mid].h = 1
		saveJSONlocalStorage('matchespl2',matchespl2)
	}
	else return false
	ShowSU(true)
	ShowPlM(pid)
}

function SuDelMatch(mid, type, plid){
	Std.debug('SuDelMatch:mid='+mid+':type='+type+':plid='+plid)
	if(type=='del'){
		//������� ���� �� ����
		for(k in matches2) if(matches2[k]==null || matches2[k].id==mid){
			delete matches2[k]
			break
		}
		for(i in matchespl2) delete matchespl2[i][mid]
		saveJSONlocalStorage('matchespl2',matchespl2)
	}else if(type=='suoff'){
		//����� ���� ��������������
		for(k in matches2) if(matches2[k]!=null && matches2[k].id==mid){
			matches2[k].su = false
			break
		}
	}else if(type=='suon'){
		//��������� ���� ��������������
		for(k in matches2) if(matches2[k]!=null && matches2[k].id==mid){
	 		delete matches2[k].su
			break
		}
	}
	//SaveData2('matches')
	saveJSONlocalStorage('matches2',matches2)
	ShowSU(true)
	ShowPlM(plid)
}

function CheckTrash() {
	Std.debug('Start --> CheckTrash()')

	//count top11
	var pls = players.sort(sSkills)
	var num = 0
	var ss = 0
	for(i in players){
		if(num<11) ss += players[i].sumskills
		num++
	}
	ss = (ss/11)*0.8
	Std.debug('CheckTrash:ss='+ss)
	if(isNaN(ss)) return false
	team_cur.age = 0
	team_cur.tmorale = 0
	team_cur.tform = 0
	team_cur.pnum = 0
	for (let i in players) {
		var pli = players[i]
		if (pli.sumskills<ss) {
			pli.trash = true
		} else {
			team_cur.tss 	= ((team_cur.tss * team_cur.pnum) + pli.sumskills)/(team_cur.pnum+1)
			team_cur.age 	= ((team_cur.age*team_cur.pnum)+pli.age)/(team_cur.pnum+1)
			team_cur.tform 	= ((team_cur.tform*team_cur.pnum)+pli.form)/(team_cur.pnum+1)
			team_cur.tmorale = ((team_cur.tmorale*team_cur.pnum)+pli.morale)/(team_cur.pnum+1)
			team_cur.pnum = team_cur.pnum+1
		}
	}
	team_cur.tss = parseFloat(team_cur.tss).toFixed(2)
	team_cur.avTopSumSkills = getAverageStatFromTopPlayersInTeam('sumskills');
	team_cur.age = parseFloat(team_cur.age).toFixed(2)
	team_cur.tform = parseFloat(team_cur.tform).toFixed(2)
	team_cur.tmorale = parseFloat(team_cur.tmorale).toFixed(2)

	GetFinish('trash', true)
}

function ModifyTeams() {
	Std.debug('Start --> ModifyTeams()');

	if (!save && typeof(teams[team_cur.tid].tname) !== 'undefined') {
		save = true
		Std.debug('ModifyTeams:need save(have)')
	}
	let tmt = {}
	for(let i in team_cur) {
		tmt[i] = (team_cur[i] != '' ? team_cur[i] : (typeof(teams[cid][i])!='undefined' ? teams[cid][i] : ''))
	}
	teams[cid] = tmt;

	SaveData('teams');
}

function GetInfoPageTm() {
	Std.debug('Start --> GetInfoPageTm()');

	// Get current club data
	var task_name   = $('table.layer1 td.l4:eq(3)').text().split(': ',2)[1]
	var screit_name = $('table.layer1 td.l2:eq(1)').text().split(': ',2)[1].split(' (')[0]

	team_cur.tid	= cid
	team_cur.tdate	= today
	team_cur.tname	= $('td.back4 table table table:first td:last').text().split(' (')[0]
	team_cur.ttown	= $('td.back4 table table table:first td:last').text().split('(')[1].split(',')[0]
	team_cur.ttask	= (rtasks[task_name]!=undefined ? rtasks[task_name] : task_name)
	team_cur.twage	= 0
	team_cur.tvalue	= 0
	team_cur.tsvalue= 0
	team_cur.tss	= 0;
	team_cur.avTopSumSkills = 0;
	team_cur.age	= 0
	team_cur.tplace	= ''
	team_cur.sname	= $('table.layer1 td.l4:eq(0)').text().split(': ',2)[1]
	team_cur.ssize	= parseInt($('table.layer1 td.l4:eq(2)').text().split(': ',2)[1])
	team_cur.ncode	= parseInt(Url.value('j',$('td.back4 table table:first table:first td:eq(1) a')[0]))
	team_cur.nname	= $('td.back4 table table:first table td:eq(3) font').text().split(', ')[1].split(')')[0]
	team_cur.did	= ''
	team_cur.mname	= $('td.back4 td.l3:first span').text()
	team_cur.mid	= parseInt(Url.value('id',$('td.back4 td.l3:first a')[0]))
	team_cur.pnum	= 0
	team_cur.scbud	= parseInt($('table.layer1 td.l2:eq(1)').text().split('(',2)[1].split(')')[0])
	team_cur.screit	= (rschools[screit_name]!=undefined ? rschools[screit_name] : screit_name)
	team_cur.my		= (team_cur.mname == curManagerNick ? true : false)
	team_cur.tform	= 0
	team_cur.tmorale= 0

	// Save my team id for script "match"
	if(team_cur.my) {
		$('a#teamsu').show()
		save = true
		localStorage.myteamid = cid
		localStorage.mycountry = team_cur.ncode + '.' + team_cur.nname
		var pic = ($('table.layer1 td[rowspan=3] img:first').attr('src')).split('/')[3].split('.')[0]
		if(cid+'a'!=pic){
			localStorage.myteampic = pic;
		} else {
			delete localStorage.myteampic;
		}
	}
	// �������� ��� ������� �� ���� ������ - ����� ��������
	if(!save && localStorage.mycountry!=undefined && String(localStorage.mycountry).split('.')[1]==team_cur.nname) {
		save = true
	}

	Std.debug('End --> GetInfoPageTm()');

	GetFinish('pg_teams', true);
}

function Print(dataname){
	Std.debug('Print:'+dataname)
	var head = list[dataname].split(',')
	var data = []
	switch (dataname){
		case 'players': data = players;	break
		case 'teams': 	data = teams;	break
//		case 'divs'	: 	data = divs;	break
		default: return false
	}
	var text = '<table width=100% border=1>'
	text+= '<tr>'
	for(j in head) text += '<th>'+head[j]+'</th>'
	text+= '</tr>'
	for(i in data){
		text += '<tr>'
		for(j in head) text += '<td>' + (data[i][head[j]]!=undefined ? data[i][head[j]] : '_')  + '</td>'
		text += '</tr>'
	}
	text += '</table>'
	$('td.back4').prepend(text)
}
function getJSONlocalStorage(dataname,data){
	Std.debug('getJSONlocalStorage:'+dataname)
	if(String(localStorage[dataname])!='undefined'){
		var data2 = JSON.parse(localStorage[dataname]);
		switch(dataname){
			case 'matchespl2': 
				for(k in data2){
					data[k] = []
					for(l in data2[k]){
						if(data2[k][l].id!=undefined) data[k][data2[k][l].id]= data2[k][l]
						else data[k][l]= data2[k][l]
					}
				}
				break
			default:
				for(k in data2) data[k] = data2[k]
		}
//		for(g in matches2) Std.debug('g='+g+':data='+matches2[g].id)
	} else return false
}
function saveJSONlocalStorage(dataname,data){
	Std.debug('saveJSONlocalStorage:'+dataname)
	switch(dataname){
		case 'matchespl2': 
			var data2 = {}
			for(k in data){
				var d2 = []
				for(l in data[k]){
					d2.push(data[k][l])
				}
				data2[k] = d2
			}
			break
		default:
			var data2 = []
			for(i in data) if(data[i]!=null) data2.push(data[i])
	}
	localStorage[dataname] = JSON.stringify(data2)
}

/**
 * Save into web db
 *
 * @param dataName string db name
 * @returns {boolean}
 */
async function SaveData(dataName) {
	Std.debug('SaveData:' + dataName + ':save=' + save);

	if (!save || url.h == 1 || (dataName == 'players' && url.j != 99999)) {
		return false
	}

	let data = [];
	let head = list[dataName].split(',');
	switch (dataName) {
		case 'players':
			data = players;
			break;
		case 'teams':
			data = teams;
			break;

		default:
			return false;
	}
	// If client use FF
	if (ff) {
		var text = ''
		for (let i in data) {
			text += (text != '' ? '#' : '')
			if(typeof(data[i])!='undefined') {
				var dti = data[i]
				var dtid = []
				for(let j in head) {
					dtid.push(dti[head[j]] === undefined ? '' : dti[head[j]])
				}
				text += dtid.join('|')
			}
		}
		localStorage[dataName] = text
	} else {
		for (let i in data) {
			// ����������� ������ ��� ������ � ��
			let dti = data[i];
			// ���� �� �������� ��������� � �� (id)
			//let key = dti[head[0]];
			// ��������� ������� ��� ������� ������, � ��� tid -> id
			if (head[0] === 'tid') {
				dti['id'] = dti['tid'];
			}

			let result = await addObject(dataName, dti);

			Std.debug(result);
		}
	}
}

/**
 * ��������� ������ �� web db
 *
 * @param dataName string �������� �������
 * @returns {boolean}
 */
async function GetData(dataName) {
	Std.debug('Start --> GetData from ' + dataName);

	let data = [];
	// �������� �������� � ��
	let head = list[dataName].split(',');
	switch (dataName) {
		case 'players':
			data = players2;
			break;
		case 'teams':
			data = teams;
			break;
//		case 'matches':	 data = matches;	break
//		case 'matchespl':data = matchespl;	break
		default:
			return false;
	}

	// ���� ���� ����� � FF
	if (ff) {
		var text1 = String(localStorage[dataName])
		if (text1 != 'undefined' && text1 != 'null') {
			var text = text1.split('#')
			for (i in text) {
				var x = text[i].split('|')
				var curt = {}
				var num = 0
				for(j in head){
					curt[head[j]] = (x[num]!=undefined ? x[num] : '')
					num++
				}
				data[curt[head[0]]] = {}
				if(curt[head[0]]!=undefined) data[curt[head[0]]] = curt
			}
			GetFinish('get_' + dataName, true)
		} else {
			GetFinish('get_' + dataName, false)
		}			
	} else {
		// ���� indexedDb not init, �������� ��� �������
		if (!db) {
			await DBConnect();
		}

		// ���� ��������� �� ���� -> �������
		if (!db.objectStoreNames.contains(dataName)) {
			GetFinish('get_' + dataName, true);
		}

		// �������� ��� ������ �� ����������� �������
		const requestResult = await getAll(dataName);
		// ���� ���� ������ �����-���� ������ � ���������
		if (requestResult !== undefined && requestResult.length > 0) {
			Std.debug('GetData from ' + dataName + ' --> success');
			Std.debug('Found rows: ' + requestResult.length);

			// ���� �� �������� � ���������� ����
			for (let i = 0; i < requestResult.length; i++) {
				let row = requestResult[i];
				let id = row[head[0]];

				data[id] = row;
			}
		}

		GetFinish('get_' + dataName,true);
	}
}

function checkDeleteMatches(){
	Std.debug('checkDeleteMatches()')
	if (url.j != 99999 || url.j != parseInt(localStorage.myteamid)) return false
	var checksu = 0
	for (i in players) checksu += parseInt(players[i].games)
	Std.debug('checkDeleteMatches:checksu='+checksu)
	if(checksu==0){
		Std.debug('checkDeleteMatches:true')
		matches2.length = 0
		matchespl2.length = 0
//		plsu.length = 0
		ShowSU(true)
		ShowRoster()
		delete localStorage.matches2
		delete localStorage.matchespl2
	}
}

function GetInfoPagePl() {
	Std.debug('GetInfoPagePl()')
	$('tr[id^=tblRosterTr]').each(function(i,val) {

		var eurl	= $(val).find('a[trp="1"]').attr('href')
		var playerUrl = $(val).find('td:eq(1) a').attr('href')
		var pid 	= Url.value('j',$(val).find('td:eq(1) a')[0])
		var pn		= parseInt($(val).find('td:first').text())
		var age		= parseInt($(val).find('td:eq(3)').html())
		var morale	= parseInt($(val).find('td:eq(4)').html())
		var form	= parseInt($(val).find('td:eq(5)').html())
		players[pid] = {}
		players[pid].pn 	= pn
		players[pid].id 	= pid
		players[pid].tid 	= cid
		players[pid].num 	= i
		players[pid].hash	= Url.value('z',$(val).find('td:eq(1) a:first')[0])
		players[pid].name	= Std.trim($(val).find('td:eq(1) a').html()
								.split('<img')[0]
								.replace('(*)','')
								.replace('<i>','')
								.replace('</i>',''))
		players[pid].d		= ($(val).find('td:eq(1) img[src*=system/img/g/d.png]').html()==null ? 0 : $(val).find('td:eq(1) img[src*=system/img/g/d.png]').attr('src'))
		players[pid].t		= ($(val).find('td:eq(1) img[src*=system/img/g/t]').html()==null ? 0 : $(val).find('td:eq(1) img[src*=system/img/g/t]').attr('src'))
		players[pid].nid	= $(val).find('td:eq(2) img').attr('src')
								.split('/')[4]
								.split('.')[0]
		players[pid].age	= age
		players[pid].morale	= morale
		players[pid].mchange= 0
		players[pid].form	= form
		players[pid].fchange= 0
		players[pid].games	= parseInt($(val).find('td:eq(6)').html())
		players[pid].goals	= parseInt($(val).find('td:eq(7)').html())
		players[pid].passes	= parseInt($(val).find('td:eq(8)').html())
		players[pid].ims	= parseInt($(val).find('td:eq(9)').html())
		players[pid].rate	= parseFloat($(val).find('td:eq(10)').html())
		players[pid].position= $(val).find('td:eq(12)').html()
		players[pid].value 	= 0
		players[pid].valuech= 0
		if(eurl!=undefined) players[pid].eurl = eurl
		if(playerUrl!=undefined) players[pid].playerUrl = playerUrl
		Std.debug('pl url', eurl);

		team_cur.tform 		= ((team_cur.tform*team_cur.pnum)+ form)/(team_cur.pnum+1)
		team_cur.tmorale 	= ((team_cur.tmorale*team_cur.pnum)+ morale)/(team_cur.pnum+1)
		team_cur.age 		= ((team_cur.age*team_cur.pnum)+ age)/(team_cur.pnum+1)
		team_cur.pnum 		= team_cur.pnum+1

		Ready()
	})
	Std.debug('GetInfoPagePl:done')
}

function Ready(vip = undefined) {
	if (vip === undefined) {
		countSostav++
		if (countSostav === countSquadMax) {
			GetFinish('pg_players', true);
		}
	} else {
		countSquadVIP++;
		// fulfill all players from squad
		if (countSquadVIP === countSquadMax) {
			for (let i in players) {
				GetPl(i);
			}

			GetFinish('pg_playersVip', true);
		}
	}
}

function ModifyPlayers(vip = undefined) {
	//'id,tid,num,form,morale,fchange,mchange,value,valuech,name,goals,passes,ims,rate',
	Std.debug('ModifyPlayers:my=' + team_cur.my)

	if (!team_cur.my) {
		return false;
	}
	let remember = false;
	// Check for update
	for(let i in players) {
		let pl = players[i]
//		Std.debug('Check:'+pl.id+':'+typeof(players2[pl.id]))
		if (typeof(players2[pl.id])!='undefined') {
			let pl2 = players2[pl.id]
			if (!remember && (pl.morale != pl2.morale || pl.form != pl2.form || (pl.value!=0 && pl.value != pl2.value))){
				remember = true
				Std.debug('ModifyPlayers:NeedSave:id='+pl.id+':morale='+pl.morale +'/'+pl2.morale+':form='+pl.form+'/'+pl2.form+':value='+pl.value+'/'+pl2.value)
				break;
			}
		}
	}

	// Calculate
	Std.debug('Start --> ModifyPlayers:calculate');

	for (let i in players) {
		let pl = players[i];
		if (typeof(players2[pl.id])!='undefined') {
			let pl2 = players2[pl.id]
			//Std.debug(pl.id+':'+pl.goals+'='+pl2.goals)
			if (remember) {
				players[i].mchange = pl.morale - pl2.morale
				players[i].fchange = pl.form   - pl2.form
				if (pl.value!=0) {
					players[i].valuech = pl.value   - pl2.value
				} else {
					if(pl2.value>0) players[i].value = pl2.value
				}
			} else {
				players[i]['mchange'] = pl2.mchange
				players[i]['fchange'] = pl2.fchange
				players[i]['valuech'] = pl2.valuech
			}
			//Std.debug('plCalc '+pl.id+':'+pl.form+'/'+pl.fchange)
		}
	}

	Std.debug('End --> ModifyPlayers:calculate');
	// Update page
	Std.debug('Start --> ModifyPlayers:UpdatePage');

	if (vip === undefined) {
		for (let i in players) {
			let pl = players[i]
//		$('table#tblRoster tr#tblRosterTr'		+ pl.pn + ' td:eq(4)').append(ShowChange(pl.mchange))
//		$('table#tblRoster tr#tblRosterRentTr'	+ pl.pn + ' td:eq(4)').append(ShowChange(pl.mchange))
			if (typeof(players2[pl.id])!='undefined') {
				let pl2 = players2[pl.id]
				$('table#tblRoster tr#tblRosterTr'	+ pl.pn + ' td:eq(7)').append(ShowChange(pl.goals-pl2.goals, true))
				$('table#tblRoster tr#tblRosterTr'	+ pl.pn + ' td:eq(8)').append(ShowChange(pl.passes-pl2.passes, true))
				$('table#tblRoster tr#tblRosterTr'	+ pl.pn + ' td:eq(9)').append(ShowChange(pl.ims-pl2.ims, true))
			}
			sumvaluechange += pl.valuech/1000;
		}
	}

	Std.debug('ModifyPlayers:sumvaluechange=' + sumvaluechange);
	// Save if not team21
	if (remember) {
		SaveData('players')
	}

	var remember3 = false
	var lsgday = String(localStorage.gday)
	var curgday = 0
	if (!team_cur.my || lsgday=='undefined' || isNaN(parseInt(lsgday.split('.')[1]))){
		return false;
	}
	else curgday = parseInt(lsgday.split('.')[1])

	if (players3[0]==undefined) {
		remember3 = true
		players3[0] = curgday
		for (let i in players) {
			var pl = players[i]
			var pl3 = {}
			pl3.id	= pl.id
			if(pl.morale!=100)	pl3.m	= pl.morale
//			if(pl.value!=0)		pl3.v	= pl.value
			if(pl.goals!=0)		pl3.g	= pl.goals
			if(pl.ims!=0)		pl3.i	= pl.ims
			if(pl.passes!=0)	pl3.p	= pl.passes
			if(pl.rate!=0)		pl3.r	= pl.rate
			if(pl.games!=0)		pl3.m	= pl.games
			players3.push(pl3)
		}
		Std.debug('ModifyPlayers:save(first)')
	} else {
		// ��������� � ������� � ���������
		var dgday = parseInt(players3[0])
//		if(dgday==curgday)
	}

	if (remember3) {
		saveJSONlocalStorage('players2', players3);
	}
}

/**
 * Get player info from url and load into hidden table
 *
 */
function GetInfoPagePlVip() {
	Std.debug('Start --> GetInfoPagePlVip()',players);

	for (let k in players) {		
		let eUrl = players[k].eurl
		Std.debug('get url', eUrl);
		if (eUrl !== undefined) {
			$('td.back4').append('<table id=pl' + k + ' hidden><tr><td id=pl' + k + '></td></tr></table>');
			$('td#pl'+ k).load(eUrl + ' center:first', function() {
				Ready('vip');
			});
		}
	}

	Std.debug('End --> GetInfoPagePlVip');
}

/**
 * Fulfill player info from hidden table
 *
 * @param pid player ID
 */
function GetPl(pid) {
	// get player skills with number pid
	var skillsum = 0
	var skillchange = []
	$('td#pl' + pid + ' table:first td:even').each(function() {
		var skillarrow = ''
		var skillname = $(this).html();
		var skillvalue = parseInt($(this).next().html().replace('<b>',''));
		if ($(this).next().find('img').attr('src') != undefined){
			skillarrow = '.' + $(this).next().find('img').attr('src').split('/')[3].split('.')[0] 		// "system/img/g/a0n.gif"
		}
		skillsum += skillvalue;
		players[pid][skillname] = skillvalue + skillarrow

		if($(this).next().html().indexOf('*') != -1) {
			skillchange.push(skillname)
		}
	})
	players[pid].sumskills	= skillsum
	players[pid].sorting	= skillsum
	players[pid].skchange	= (skillchange[0] != undefined ? skillchange.join(',') : '')

	// get player header info
	$('td#pl'+pid+' table').remove()
	var head = $('td#pl'+pid+' b:first').html()
	players[pid].rent		= (head.indexOf('� ������ �� �����') != -1 ? true : false)
	players[pid].natfull 	= head.split(' (������')[0].split(', ')[1]
	players[pid].value		= parseInt(head.split('�������: ')[1].split(',000$')[0].replace(/,/g,''))*1000
	players[pid].valuech	= 0
	players[pid].contract 	= parseInt(head.split('��������: ')[1])
	players[pid].wage 		= parseInt(head.split('�., ')[1].split('$')[0].replace(/,/g,''))

	players[pid].svalue		= GetNomData(pid)
	//Std.debug(players[pid].value+':'+players[pid].svalue)

	team_cur.twage	+= players[pid].wage
	team_cur.tvalue	+= players[pid].value/1000
	team_cur.tsvalue+= players[pid].svalue/1000

	// Remove hided(autogen) player table
	$('table#pl' + pid).remove();
}

/**
 * ����� ���������� ������� ������ ��������� �������(������ ������ �� �������� �������)
 *
 */
function ShowVip() {
	Std.debug('Start --> ShowVip()');

	$('a#showvip').removeAttr('href');

	GetInfoPagePlVip();

	Std.debug('End --> ShowVip()');
}

function PrintRightInfo() {
	Std.debug('PrintRightInfo()')
	$('th#osform').html(parseFloat(team_cur.tform).toFixed(2) + '&nbsp;')
	$('th#osmorale').html(parseFloat(team_cur.tmorale).toFixed(2) + '&nbsp;')
	$('th#osage').html(parseFloat(team_cur.age).toFixed(2) + '&nbsp;')
}

/**
 * Print info into right block for VIP clients
 */
function PrintRightInfoVip() {
	Std.debug('Start --> PrintRightInfoVip()');

	const notvip ='<font color=BABDB6>��� VIP</font>';

	$('th#osform').html(team_cur.tform + '&nbsp;');
	$('th#osmorale').html(team_cur.tmorale + '&nbsp;');
	$('th#osage').html(team_cur.age + '&nbsp;');
	$('th#osskills').html((team_cur.tss !== 0 ? team_cur.tss + '&nbsp;' : notvip));
	// calculate average sumSkills from top16 players
	$('th#osSkills16_th').html(team_cur.avTopSumSkills !== 0 ? team_cur.avTopSumSkills + '&nbsp;' : notvip)
	$('th#ossvalue').html((team_cur.tsvalue!=0 ? ShowValueFormat(team_cur.tsvalue)+'�' : notvip));
	$('th#osnom').html((team_cur.tvalue!=0 ? ShowValueFormat(team_cur.tvalue)+'�' : notvip));
	$('th#nomch').html((sumvaluechange!= 0 ? '&nbsp;'+ShowChange(sumvaluechange) : notvip));
	$('th#oszp').html((team_cur.twage!=0 ? ShowValueFormat(team_cur.twage)+'&nbsp;' : notvip));

//	if(team_cur.tss!=0)	
	$('a#teamskills').attr('href','javascript:void(ShowSkills(1))')
//	else $('a#teamskills').after('&nbsp;'+notvip)

	Std.debug('End --> PrintRightInfoVip()');
}

function EditFinance(){
	Std.debug('EditFinance()')
	var txt = $('table.layer1 td.l4:eq(1)').text().split(': ')[1]
	var txt2 = ''
	switch (txt){
		case '�������': 				 txt2 += '������ 0';	break;
		case '������': 					 txt2 += '1$�-200$�';	break;
		case '������': 					 txt2 += '200$�-500$�';	break;
		case '�������': 				 txt2 += '500$�-1$�';	break;
		case '����������': 				 txt2 += '1$�-3$�';		break;
		case '�������������': 			 txt2 += '3$�-6$�';		break;
		case '��������': 				 txt2 += '6$�-15$�';	break;
		case '�������': 				 txt2 += '15$�-40$�';	break;
		case '������ ������ ������ :-)': txt2 += '������ 40$�';	break;
		default:
			var fin = parseInt(txt.replace(/,/g,'').replace('$',''))
			if 		(fin >  40000000)	{txt = '������ ������ ������';	txt2 = '������ 40$�'}
			else if (fin >= 15000000)	{txt = '�������';				txt2 = '15$�-40$�'}
			else if (fin >=  6000000) 	{txt = '��������';				txt2 = '6$�-15$�'}
			else if (fin >=  3000000) 	{txt = '�������������';			txt2 = '3$�-6$�'}
			else if (fin >=  1000000) 	{txt = '����������';			txt2 = '1$�-3$�'}
			else if (fin >=   500000) 	{txt = '�������';				txt2 = '500$�-1$�'}
			else if (fin >=   200000) 	{txt = '������';				txt2 = '200$�-500$�'}
			else if (fin >=		   0)	{txt = '������';				txt2 = '1$�-200$�'}
			else if (fin < 		   0)	{txt = '�������';				txt2 = '������ 0'}
	}
	$('#finance1').html(txt)
	$('#finance2').html(txt2)
	team_cur.tfin = txt2
}

function EditSkillsPage(){
	Std.debug('EditSkillsPage()')
	$('table#tblRostSkills')
		.attr('width','886')
		.find('td[bgcolor=white]').removeAttr('bgcolor').end()
		.find('td:contains("*")').attr('bgcolor','white').end()
		.find('img').attr('height','10').end()
		.find('tr').each(function(){
			$(this).attr('height','20').find('td:eq(1)').html(
				$(this).find('td:eq(1)').html().replace('<br>','&nbsp;')
			)
		})
} 

function ShowSkillsY() {
	Std.debug('ShowSkillsY()')
	switch (type){
		case 'num': 
			$('table#tblRostSkills img').attr('height','10').show();
			type = 'img'; break
		case 'img':
			$('table#tblRostSkills img').hide();
			type = 'num';break
		default:
			Std.debug('Error ShowSkillsY: unknown type:<'+type+'>')
	}
	$('table#tblRostSkills tr').each(function(){
		$(this).find('td:eq(1)').html(
			$(this).find('td:eq(1)').html().replace('<br>','&nbsp;')
		)
	})
}

function ShowPlayersValue() {
	Std.debug('ShowPlayersValue()')
	if (team_cur.tvalue === 0) return false
	if (nom) {
		nom = false
		var nomtext = ''
		var pls = players.sort(sValue)
		var sumval = 0
		var numpl = 0
		for(let i in pls) {
			numpl++
			sumval += pls[i].value
			var bgcolor = ''
			var style = '';
			if(i === 15) style = ' style="border-bottom:1px black solid;"'
			if(i<18) bgcolor = ' class=back4'//3
			if(i<5)  bgcolor = ' class=back3'//1
			var f1 = (pls[i].trash ? '<font color=#888A85>' : '')
			var f2 = (pls[i].trash ? '</font>' : '')
			nomtext += '<tr id="nom"'+bgcolor+'>'
			nomtext += '<td'+(pls[i].rent ? ' bgcolor=#a3de0f' : '')+' nowrap'+style+'>' +f1+ ShowShortName(pls[i].name).fontsize(1) +f2+ '</td>'
			nomtext += '<td align=right'+style+'>' + (ShowValueFormat(pls[i].value/1000) + '�').fontsize(1) + '</td>'
			nomtext += (pls[i].valuech==0 ? '' : '<td>&nbsp;'+ShowChange(pls[i].valuech/1000)+'</td>')
			nomtext += '</tr>'
		}
		nomtext += '<tr id="nom"><td><i>'+('�������').fontsize(1)+'</i></td><td align=right><i>'+(ShowValueFormat(parseInt(sumval/numpl)/1000) + '�').fontsize(1)+'</i></td><td></td><tr>'
		$('#osnom').after(nomtext + '<tr id="nom"><td>&nbsp;</td></tr>')
	} else {
		nom = true
		$('tr#nom').remove()
	}
}

/**
 * Calculate and show face value+
 */
function ShowPlayersSValue() {
	Std.debug('Start --> ShowPlayersSValue()');

	if (team_cur.tsvalue === 0) {
		return false
	}

	if (svalue) {
		svalue = false;
		var nomtext = ''
		var pls = players.sort(sSValue);
		for (let i in pls) {
			var bgcolor = ''
			if(i<18) bgcolor = ' class=back4'
			if(i<5)  bgcolor = ' class=back3'
			var f1 = (pls[i].trash ? '<font color=#888A85>' : '') //888A85
			var f2 = (pls[i].trash ? '</font>' : '')
			nomtext += '<tr id="svalue"'+bgcolor+'>'
			nomtext += '<td'+(pls[i].rent ? ' bgcolor=#a3de0f' : '')+' nowrap>' +f1+ ShowShortName(pls[i].name).fontsize(1) +f2+ '</td>'
			nomtext += '<td align=right>' + (ShowValueFormat(pls[i].svalue/1000) + '�').fontsize(1) + '</td>'
//			nomtext += (pls[i].valuech==0 ? '' : '<td>&nbsp;'+ShowChange(pls[i].valuech/1000)+'</td>')
			nomtext += '</tr>'
		}
		$('#ossvalue').after(nomtext + '<tr id="svalue"><td>&nbsp;</td></tr>')
	} else {
		svalue = true
		$('tr#svalue').remove()
	}

	Std.debug('End --> ShowPlayersSValue()');
}

function ShowPlayersZp() {
	Std.debug('Start --> ShowPlayersZp()');
	if (team_cur.twage === 0) {
		return false
	}

	if (zp) {
		zp = false
		var text = ''
		var pls = players.sort(sZp)
		var sumzp = 0
		var plsnum = 0
		for(i in pls) {
			sumzp += pls[i].wage
			plsnum++
			var bgcolor = ''
			var f1 = (pls[i].trash ? '<font color=#888A85>' : '')
			var f2 = (pls[i].trash ? '</font>' : '')
			if(pls[i].contract==1) bgcolor = ' bgcolor=#FF9966' //red
			if(pls[i].contract==2) bgcolor = ' bgcolor=#FCE93B' //yellow
			if(pls[i].contract==5) bgcolor = ' bgcolor=#A3DE8F' //green
			text += '<tr id="zp">'
			text += '<td'+(pls[i].rent ? ' bgcolor=#a3de0f' : '')+' nowrap>' +f1+ ShowShortName(pls[i].name).fontsize(1) +f2+ '</td>'
			text += '<td align=right>' + (ShowValueFormat(pls[i].wage) + '&nbsp;').fontsize(1) + '</td>'
			text += '<td'+bgcolor+'>' + (pls[i].contract + (pls[i].contract == 5 ? '�.' : '�.')).fontsize(1) + '</td>'
			text += '</tr>'
		}
		Std.debug('ShowPlayersZp:sumzp='+sumzp)
		text += '<tr id="zp"><td><i>'+('�������').fontsize(1)+'</i></td><td align=right><i>'+(ShowValueFormat(parseInt(sumzp/plsnum)) + '&nbsp;').fontsize(1)+'</i></td><td></td><tr>'
		$('#oszp').after(text + '<tr id="zp"><td>&nbsp;</td></tr>')
	}else{
		zp = true
		$('tr#zp').remove()
	}
}

function ShowPlayersAge(){
	Std.debug('ShowPlayersAge()')
	if(age) {
		age = false
		var text = ''
		var pls = players.sort(sAge)
		for(i in pls) {
			var f1 = (pls[i].trash ? '<font color=#888A85>' : '')
			var f2 = (pls[i].trash ? '</font>' : '')
			text += '<tr id="age"'+(pls[i].age<30 && pls[i].age>21 ? '' : ' class=back3')+'>'
			text += '<td'+(pls[i].rent ? ' bgcolor=#a3de0f' : '')+' nowrap>' 
			text +=  f1 + ShowShortName(pls[i].name).fontsize(1) + f2
			text += '</td>'
			text += '<td align=right>'+f1 + (pls[i].age+'&nbsp;').fontsize(1) + f2+'</td>'
			text += '</tr>'
		}
		$('#osage').after(text + '<tr id="age"><td>&nbsp;</td></tr>')
	} else {
		age = true
		$('tr#age').remove()
	}
}

function ShowPlayersSkillChange(){
	Std.debug('ShowPlayersSkillChange()')
//	if(team_cur.tss == 0) return false
	if(sk) {
		sk = false
		var text = ''
		var pls = players.sort(sSkills)
		for(i in pls) {
			var f1 = (pls[i].trash ? '<font color=#888A85>' : '')
			var f2 = (pls[i].trash ? '</font>' : '')
			text += '<tr id="skills">'
			text += '<td'+(pls[i].rent ? ' bgcolor=#a3de0f' : '')+' nowrap>' 
			text +=  f1 + ShowShortName(pls[i].name).fontsize(1) + f2
			text += '</td>'
			text += '<td align=right>'+f1 + (pls[i].sumskills + '&nbsp;').fontsize(1) + f2 +'</td>'
//			text += '<td>' + (pls[i].contract + (pls[i].contract == 5 ? '�.' : '�.')).fontsize(1) + '</td>'
			if(pls[i].skchange != '') {
				var skillchange = pls[i].skchange.split(',')
				for(j in skillchange) {
					text += '<tr id="skills"><td align=right colspan=2><i>'+f1+(skillchange[j] + '&nbsp;').fontsize(1)
					text += (pls[i][skillchange[j]].split('.')[0] + '&nbsp;').fontsize(1) +f2+'</i></td>'
					if(pls[i][skillchange[j]].split('.')[1] != undefined) {
						text += '<td><img height="8" src="system/img/g/'+pls[i][skillchange[j]].split('.')[1]+'.gif"></img></td>'
					}
					text += '</tr>'
				}
			}
			text += '</tr>'
		}
		$('#osskills').after(text + '<tr id="skills"><td>&nbsp;</td></tr>')
	} else {
		sk = true
		$('tr#skills').remove()
	}
}
function ShowRoster(){
	Std.debug('ShowRoster()')
//	$('table[background]:eq(1)').show()
	$('table#tblSu').hide()
	$('table#tblSuM').hide()
	$('div#divSu').hide()

	$('table#tblRostSkills').hide()
	$('div#divRostSkills').hide()

	$('table#tblRostSkillsFilter').hide()
	$('table#SumPl').hide()
	$('div#divRostSkillsFilter').hide()
	$('div#filter').hide()

	$('table#tblRoster').show()
	$('table#tblRosterFilter').show()
}

function ShowSkills(param){
	Std.debug('ShowSkills:param='+param)
	if(param == 1){
//		$('table[background]:eq(1)').hide()
		//$('td#crabglobalright').html('')

		$('table#tblSu').hide()
		$('table#tblSuM').hide()
		$('div#divSu').hide()
		$('table#tblRoster').hide()
		$('table#tblRosterFilter').hide()

		$('table#tblRostSkills').show()
		$('div#divRostSkills').show()
		$('div#divRostSkillsFilter').show()
	}

	$('table#tblRostSkills tr').remove()
	if(param == 2) type = (type=='img' ? 'num' : 'img')

	var hd = 'N ��� ��� ��� ��� ��� ��� ��� ���<br>��� ��� ��� ���<br>��� ��� ��� ��� ���<br>��� ��� ��� ��� ��� ��� ��� ��� ���'
	var hd2= hd.split(' ')

	var header = '<tr align="left" style="font-weight:bold;" id="tblRostSkillsTHTr0">'
	header += '<td><a class="sort">'+hd2.join('</a></td><td><a class="sort">')+'</a></td>'
	header += '</tr>'
	$('table#tblRostSkills').append(header)
	$('table#tblRostSkills tr:first a').each(function(i,val){
		$(val).attr('href','javascript:void(CountSkills('+i+'))')
	})

	var pf = players.sort(sSkills)
	for(i=0;i<pf.length;i++) {
		if(pf[i]!=undefined){
			var d = (pf[i].d==0 ? '' : ' <img width=12 valign=top src="'+pf[i].d+'"></img>')
			var t = (pf[i].t==0 ? '' : ' <img width=12 valign=top src="'+pf[i].t+'"></img>')
			var tr ='<tr height=20 id="'+pf[i].position+'">'
			var trash = (pf[i].trash ? ' hidden' : '')
			for(j in hd2) {
				var tdcolor = (countSk[j] == 1 ? ' id=colw bgcolor=white' : '')
				var skn = hd2[j]
				var key1 = pf[i][skills[skn.split('<br>')[0]]]
				var key2 = pf[i][skills[skn.split('<br>')[1]]]
				var sk = (key1!=undefined ? key1 : key2)
//				if(skn=='x')					tr += '<td><a id="x" href="javascript:void(HidePl('+(i+1)+',true))">x</a></td>'
				if(skn=='���')					tr += '<td'+tdcolor+'><a href="plug.php?p=refl&t=p&j='+pf[i].id+'&z='+pf[i].hash+'">'+sk+'</a>'+d+t+'</td>'
				else if(skn=='N') 				tr += '<td'+tdcolor+'>'+sk+'</td>'
				else if(skn=='���') 			tr += '<td'+tdcolor+trash+'>'+sk+'</td>'
				else if(skn=='���') 			tr += '<td'+tdcolor+'><b><a id="x" href="javascript:void(HidePl('+(i+1)+','+(pf[i].trash ? 'false' : 'true')+'))">'+parseInt(sk)+'</a></b></td>'
				else if(!isNaN(parseInt(sk)) && type=='num')	tr += '<td'+tdcolor+trash+'>'+parseInt(sk)+'</td>'
				else if(!isNaN(parseInt(sk)) && type=='img')	tr += '<td'+tdcolor+trash+'>'+String(sk).split('.')[0]+(String(sk).split('.')[1]!=undefined ? '&nbsp;<img height="10" src="system/img/g/'+String(sk).split('.')[1]+'.gif"></img>' : '')+'</td>'
				else 							tr += '<td'+tdcolor+'> </td>'
			}
			tr += '</tr>'
			$('table#tblRostSkills').append(tr)

//			Std.debug(i+':'+pf[i].trash+':'+pf[i].name)
   		}
	}

	// Run filter
	Filter(3,'')
}

function HidePl(num,fl){
	Std.debug('HidePl:num='+num+':fl='+fl)
	if(fl){
		$('table#tblRostSkills tr:eq('+num+') a#x').attr('href','javascript:void(HidePl('+(num)+',false))')
		$('table#tblRostSkills tr:eq('+num+') td:gt(2)').each(function(){
			$(this).hide()
		})
		players[num-1].trash = true
	}else{
		$('table#tblRostSkills tr:eq('+num+') a#x').attr('href','javascript:void(HidePl('+(num)+',true))')
		$('table#tblRostSkills tr:eq('+num+') td:gt(2)').each(function(){
			$(this).show()//.removeAttr('style')
		})
		players[num-1].trash = false
	}
	ShowSumPlayer()
}

function ShowHols(p){
	Std.debug('ShowHols:p='+p)
	sumH = (sumH ? false : true)
	ShowSumPlayer()
}

function ShowSumPlayer(p){
	Std.debug('ShowSumPlayer()')
	if(p!=undefined) sumP = p
	var ld = {'sum':0,'mx':0,'mn':0,'num':0}
	var head = []
	sumplarr = {}
	$('table#tblRostSkills tr:first td:lt(21):gt(2)').each(function(i, val){
		head[i] = $(val).find('a').html().split('<br>')[0]
		sumplarr[head[i]] = {'sum':0,'mx':0,'mn':0,'num':0}
	})

	$('table#tblRostSkills tr:gt(0):visible').each(function(){
		$(this).find('td:lt(21):gt(2):visible').each(function(i,val){
			var tdval = parseInt($(val).text())
			var param = sumplarr[head[i]]
			param.sum  += tdval
			param.mx	= (param.mx < tdval ? tdval : param.mx)
			param.mn	= (param.mn==0 || param.mn > tdval ? tdval : param.mn)
			param.num  += 1
		})
	})

	$('table#SumPl tr#sumsk').remove()
	var tr = true
	var sumpl = ''
	for(i in sumplarr){
		var param = sumplarr[i]
		var text = (param.num==0 ? ' ' : (param.sum/param.num).toFixed(sumP) + (param.num>1 ? ' ('+param.mn+':'+param.mx+')' : ''))
		sumpl += (tr ? '<tr id="sumsk" class=back3>' : '')
		sumpl += '<td width=30%>'+skills[i]+'</td><td width=20%>'+text+'</td>'
		sumpl += (tr ? '' : '</tr>')
		tr = (tr ? false : true)
	}   
	$('table#SumPl tr#sumhead').after(sumpl)
	if(sumH){
		$('table#tblRostSkills tr:gt(0):visible').each(function(){
			$(this).find('td#colw').each(function(i, val){
				$(val).attr('id','colwy').attr('bgcolor', '#E9B96E')
			})
			$(this).find('td:[id!=colwy]').each(function(i, val){
				$(val).attr('id','coly').attr('bgcolor', '#FCE94F')
			})
		})
	}else {
		$('table#tblRostSkills tr:visible').each(function(){
			$(this).find('td#colwy').attr('bgcolor','white').attr('id','colw')
			$(this).find('td#coly').removeAttr('bgcolor').removeAttr('id')
		})
	}
}

function ShowFilter(){
	Std.debug('ShowFilter()')
	var style = $('table#tblRostSkillsFilter').attr('style')
	if(style == "display: none" || style == "display: none;" || style == "display: none; "){
		$('table#tblRostSkillsFilter').show()
		$('table#SumPl').show()
		$('div#filter').show()
	}else{
		$('table#tblRostSkillsFilter').hide()
		$('table#SumPl').hide()
		$('div#filter').hide()
//		Filter(3,'')
	}
}

function Filter(num,p){
	Std.debug('Filter:num='+num+':p='+p)
	if(num==1){
		pos1[p] = (pos1[p]==undefined || pos1[p]==0 ? 1 : 0)
	} else if(num==2){
		pos2[p] = (pos2[p]==undefined || pos2[p]==0 ? 1 : 0)
	} else {
//		for(i in pos1) pos1[i] = 0
//		for(i in pos2) pos2[i] = 0
	}
	var sumpos1 = 0
	var sumpos2 = 0
	for (i in pos1) sumpos1 += parseInt(pos1[i])
	for (i in pos2) sumpos2 += parseInt(pos2[i])
	var sumpos = sumpos1 + sumpos2
	var selectTDcolor = 'green'//'D3D7CF'
	var selectFLcolor = 'white'

    $('table#tblRostSkillsFilter th').removeAttr('bgcolor')
	$('table#tblRostSkillsFilter td').each(function(){
		$(this).attr('class','back2')
		var position = $(this).attr('id')
		var kmark = 0
		var lmark = 0
		for (k in pos1) {
			if(sumpos1==0 || (position.indexOf(k)>-1 && pos1[k]==1)) kmark=1
			if(pos1[k] == 1) $('th#'+k).attr('bgcolor',selectFLcolor)
		}
		for (l in pos2) {
			if(sumpos2==0 || (position.indexOf(l)>-1 && pos2[l]==1)) lmark=1
			if(pos2[l] == 1) $('th#'+l).attr('bgcolor',selectFLcolor)
		}
		if(kmark==1 && lmark==1 && sumpos != 0) $(this).removeAttr('class').attr('bgcolor',selectTDcolor)
	})
	$('table#tblRostSkills tr:gt(0)').each(function(j,val){
		$(val).hide()
		var position = $(val).find('td:last').text()
		var kmark = 0
		var lmark = 0
		for (k in pos1) if(sumpos1==0 || (position.indexOf(k)>-1 && pos1[k]==1)) kmark=1
		for (l in pos2) if(sumpos2==0 || (position.indexOf(l)>-1 && pos2[l]==1)) lmark=1
		if((kmark==1 && lmark==1) || sumpos == 0) $(val).show()
	})
	$('table#tblRostSkills tr:visible:even').attr('class','back2')
	$('table#tblRostSkills tr:visible:odd').attr('class','back1')
	ShowSumPlayer()
}

function CountSkills(tdid){
	Std.debug('CountSkills:tdid='+tdid)
    if(countSk[tdid]!=undefined && countSk[tdid]==1) countSk[tdid] = 0
	else countSk[tdid] = 1
	$('table#tblRostSkills tr:gt(0)').each(function(j, valj){
		var sumsel = 0
		$(valj).find('td').each(function(i, val){
			$(val).removeAttr('class')
			if(countSk[i] == 1) {
				sumsel += (isNaN(parseInt($(val).html())) ? 0 : parseInt($(val).html()))
				$(val).attr('bgcolor','white')
			}
		})
//		$(valj).find('td:eq(2)').html('<b>'+(sumsel==0 ? players[j].sumskills : sumsel)+'</b>')
		if(players[j].sumskills == players[j].sorting) players[j].sorting = sumsel
		else if(sumsel == 0) players[j].sorting = players[j].sumskills
		else players[j].sorting = sumsel
//		players[j].sorting = (players[j].sumskills == players[j].sorting ? sumsel)
	})
	ShowSkills(3)
}

function ShowShortName(fullname){
	Std.debug('ShowShortName:fullname='+fullname)
	var namearr = fullname.replace(/^\s+/, "").replace(/\s+$/, "").split(' ')
	var shortname = ''
	for(n in namearr) {
		if(n==0){
			if(namearr[1] == undefined) shortname += namearr[n]
			else shortname += namearr[n][0] + '.'
		} else {
			shortname += namearr[n] + '&nbsp;'
		}
	}
	return shortname
}

/**
 * Fix value for displaying
 *
 * @param value
 * @returns {string}
 */
function ShowValueFormat(value) {
	if (value > 1000) {
		return (value/1000).toFixed(3).replace(/\./g,',') + '$';
	} else {
		return (value) + '$';
	}
}

function sSkills(i, ii) { // �� SumSkills (��������)
    if 		(i.sorting < ii.sorting)	return  1
    else if	(i.sorting > ii.sorting)	return -1
    else								return  0
}
function sValue(i, ii) { // �� value (��������)
    if 		(i.value < ii.value)	return  1
    else if	(i.value > ii.value)	return -1
    else							return  0
}
function sSValue(i, ii) { // �� value (��������)
    if 		(i.svalue < ii.svalue)	return  1
    else if	(i.svalue > ii.svalue)	return -1
    else							return  0
}
function sZp(i, ii) { // �� zp (��������)
    if 		(i.wage < ii.wage)	return  1
    else if	(i.wage > ii.wage)	return -1
    else						return  0
}
function sAge(i, ii) { // �� zp (��������)
    if 		(i.age < ii.age)	return  1
    else if	(i.age > ii.age)	return -1
    else						return  0
}

function ShowChange(value,hide){
	if(value > 0) 		return '<sup><font color="green">+' + (hide ? ''  : value) + '</font></sup>'
	else if(value < 0)	return '<sup><font color="red">' 	+ (hide ? '-' : value) + '</font></sup>'
	else 		  		return ''
}

/**
 * Get average stat(field) from current team
 *
 * @param field Field name(for filter)
 * @param count how many players for your top u need, default = 16(11 +5)
 *
 * @return string
 */
function getAverageStatFromTopPlayersInTeam(field, count = 16) {
	// if somehow we don't have any players
	if (players.length === 0) {
		return '0';
	}

	let topSumSkills = 0;
	let playersSortedBySumSkills = players.sort(sSkills);

	for (let i = 0; i < count; i++) {
		let sumSkills = playersSortedBySumSkills[i][field];
		// if somehow we don't have 16 players
		topSumSkills += typeof sumSkills !== undefined ? sumSkills : 0;
	}

	let averageValue = topSumSkills / count;

	return parseFloat(averageValue.toString()).toFixed(2);
}
