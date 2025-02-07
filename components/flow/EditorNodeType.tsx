"use client";

import { memo, use, useState } from "react";
import { Handle, Position } from "@xyflow/react";
import { Button } from "../ui/Button";
import Editor from "../tiptap/Editor";
import { Bot, Send } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { Textarea } from "@/components/ui/textarea";
import { useNodes, useReactFlow } from "@xyflow/react";
import { Loader2, Download } from "lucide-react";
import { FaFileWord } from "react-icons/fa";
import { FaFilePdf } from "react-icons/fa6";

interface EditorNodeTypeProps {
  isConnectable: boolean;
  data: any;
  id: string;
}

export default memo(function EditorNodeType({
  isConnectable,
  data,
  id,
}: EditorNodeTypeProps) {
  const { getNodesBounds, getNode } = useReactFlow();
  const [aiUseOpen, setAiUseOpen] = useState(false); // 新增控制 Popover 打開狀態的 state
  const [wordExportOpen, setWordExportOpen] = useState(false);
  const [pdfExportOpen, setPdfExportOpen] = useState(false);

  const [wait, setWait] = useState(false);

  // 先获取指定 id 的节点
  const node = getNode(id);

  // 如果 node 存在，则将其包装成数组传入，否则传入一个空数组
  const bounds = getNodesBounds(node ? [node] : []);
  const nodes = useNodes();

  const handleGenerateContant = () => {
    console.log(bounds);
    const offsetX = bounds.width + 30;
    const offsetY = 50;

    const newNodeA = {
      id: `${nodes.length + 1}`,
      position: {
        x: nodes[nodes.length - 1].position.x + offsetX,
        y: nodes[nodes.length - 1].position.y,
      },
      type: "editorNode", // 可以根据需求设置节点类型
      data: {
        label: `${data.nodes.length + 1}`,
        toolbarPosition: Position.Top,
        content: `<p data-id="9e22a13f-e285-4ec6-b664-f4ad68508314"><strong>（一）重耳出走與投狄</strong></p>
    <p data-id="c588e960-d723-47eb-a476-ec02d7828d2f">
        晉公子重耳遭遇艱難困境時，晉國人便攻打蒲城。蒲城的居民打算迎戰，但重耳認為不宜開戰，便說：“我必須保全君父的生命與遺志，藉此享受他賜予的生祿；如果對父命不敬，這罪過將無可比擬。所以，我決定逃走。”於是他投奔狄人。隨從他的有狐偃、趙衰、顛頡、魏武子、以及司空季子。
    </p>
    <p data-id="6c5ee858-2f77-44e2-9f82-3fb386233176">
        狄國人當時攻打廧咎如，俘虜了對方的兩個女子，分送給各位公子。重耳選擇了其中名為“季隗”的女子，兩人婚配後生下伯儵和叔劉；又將另一個女子“叔隗”納為妻，嫁給了隨從趙衰，二人所生者名叫盾。重耳準備前往齊國時，對季隗說：“請你為我等待二十五年，若我二十五年內未歸，你再另嫁他人。”季隗答道：“我已為你守候了二十五年，若仍如此等待，豈不是等著木頭慢慢長大？請讓我繼續隨你等待。”結果，他在狄國居留了十二年後才起程離去。
    </p>`,
        nodes: data.nodes,
        setNodes: data.setNodes,
      },
    };

    const newNodeB = {
      id: `${nodes.length + 2}`,
      position: {
        x: nodes[nodes.length - 1].position.x + offsetX + 1000,
        y: nodes[nodes.length - 1].position.y,
      },
      type: "editorNode", // 可以根据需求设置节点类型
      data: {
        label: `${data.nodes.length + 1}`,
        toolbarPosition: Position.Top,
        content: `    <p data-id="e00ff850-92da-4f86-b578-cc0c85d471a5"><strong>（二）在各國間的遭遇</strong></p>
    <p data-id="f7d51e6a-9cdf-4b25-bb9c-5b0db138a339">
        重耳途經衛國，卻不受到衛文公的禮遇。出自五鹿時，他向路邊的野人乞討，野人給了他一塊食物；重耳見此大怒，正欲抽打那人，但隨從子犯勸道：“這是上天賜予的。”重耳便稽首受下食物並收好。</p>
    <p data-id="100cd7a5-49ba-4c03-815c-2ebc7be10399">
        到了齊國，齊桓公將他當作貴客接待，賞賜他二十乘好馬，重耳也悉心安置。但隨從們認為這做法不妥。臨行之際，重耳在桑下與人商議；結果，他的一名蠶室妾跑到姜氏那裡告密。姜氏便殺了那名妾，並對重耳說：“你心懷四方大志，消息一旦外泄，我必然會殺人以滅口。”重耳答道：“無此事。”姜氏又說：“你如此行事，恐怕會敗壞名聲。”重耳不同意。後來，姜氏與子犯密謀，先把子犯灌醉後放走；待子犯清醒時，又以戈追趕他。
    </p>
    <p data-id="3224a1e4-6cbf-4988-af48-a675718f9176">
        到了曹國，曹共公聽聞重耳隨從那副“駢脅”之姿，便想藉機觀察他的裸體。重耳洗浴時只穿得很薄，曹共公遂得以窺視。隨從中負羈的人（或稱負羈之妻）對曹共公說：“我看晉公子的隨從個個都有擔當相國之才。如果重耳任用他們作相，必然會使國家動亂；反叛國家後，勢必會獲得諸侯的支持，而屆時處理失禮之人，曹國的首領恐怕要遭殃。您何不早點投降呢？”於是，曹國設宴饋贈，並將重耳安置在城牆邊。重耳接受饗宴後，便返回城牆。
    </p>
    <p data-id="34794bee-d43a-4640-85ce-0a2789de6ec9">到了宋國，宋襄公賞贈他二十乘好馬；而在鄭國，鄭文公也未給予禮遇。鄭國大臣叔詹上疏勸諫說：</p>
    <blockquote data-id="a2c2b6d6-bcc6-4376-b3ad-7d12e2278d28">
        <p data-id="a83dbc1f-8657-4028-a0c2-eb141afad1c8">
            “臣聞天意啟示之事，人力難及。晉公子具備三項特質：<br>一、雖然男女同姓，但他的後代並不繁盛；<br>二、晉公子出自姬族，至今僅存一人，面臨外患，而上天必將扶持他；<br>三、他的隨從中有三位超群出眾的人才。<br>君若能禮待他，則晉、鄭兩國即使共同對付外夷，亦會得其助。況且，上天所啟示者，誰能抗拒？”<br>但君主不予採納。
        </p>
    </blockquote>
    <p data-id="68431369-27d1-4d57-9aad-afddd8fa8c91">
        到了楚國，楚國君宴請重耳，對他說：“若公子日後反晉，如何報答我這點薄恩？”重耳答：“孩子們的玉帛、羽毛、牙齒和皮革，君家自有；若波及到晉國，那正屬於君家的餘力，又何必回報？”楚君又問：“既如此，你準備如何回報我？”重耳道：“如果藉君之靈能助我反晉，使晉、楚聯兵，於中原一決雌雄，我便會以三分之義棄君；若未能成功，則以左手執鞭，右手攜帶錢囊，與君周旋。”其時，子玉要求殺死重耳；但楚君說：“晉公子既博學節儉、文雅有禮，他的隨從又既嚴謹寬容、忠誠有能，而晉侯內外無親信，情勢危急。我聞姬姓乃唐叔之後，雖有衰微，但日後必有大用之人扶持晉公子。天意既然如此，誰又能阻撓？違逆天命必遭大災。”於是，楚國將重耳送往秦國。
    </p>
    <p data-id="6f6c93f9-ccb4-46a3-87b4-fbaedd0a528c">
        秦國君秦伯接納了他，並送來五位女子，其中懷贏也在內。待重耳在沃盥沐浴後，秦伯便揮手驅逐他，怒曰：“秦、晉實力相當，何以看輕我！”重耳心生懼意，只得投降受囚。不久之後，秦國又將他用作公享的工具。隨從子犯對重耳說：“我自覺不如趙衰文雅，請讓趙衰隨從。”重耳便作《河水》詩，秦伯則作《六月》詩。趙衰說：“重耳如此一拜就獲賜了。”重耳遂低頭叩拜，秦伯亦降一級禮畢便辭，趙衰又說：“君既被稱為能佐天子的重耳，重耳豈敢不拜您！”
    </p>
    <p data-id="aa721fa7-719d-481e-8b71-5de4780e0d9f">
        到了二十四年春，正月，秦伯正式接納重耳，但沒有留下書面記錄，也未通知外界。當重耳經過河邊時，子犯將一塊壁（或作象徵物）交給重耳，說：“我這個負著羈縻、隨您巡遊天下的人，罪過實在太多，連我自己都深感愧疚，更何況您呢？請允許我由此逃走吧。”重耳答：“那些不能與我舅氏同心者，就如同清澈的白水一般。”於是，他把那塊象徵物投入河中。隨後，他渡過河流，圍困令狐，進入桑泉，並擒獲了趙衰。二月甲午，晉軍在廬柳駐紮；秦伯派使者捆綁重耳送至晉軍，晉軍遂撤退，於郇集結。辛丑日，狐偃與秦、晉大夫在郇結盟；壬寅日，重耳進入晉軍；丙午日，進入曲沃；丁未日，朝見武宮；戊申日，派人暗中殺害懷公於高梁。這些事皆未作書面記載，也未通知他人。
    </p>`,
        nodes: data.nodes,
        setNodes: data.setNodes,
      },
    };

    const newNodeC = {
      id: `${nodes.length + 3}`,
      position: {
        x: nodes[nodes.length - 1].position.x + offsetX + 2000,
        y: nodes[nodes.length - 1].position.y,
      },
      type: "editorNode", // 可以根据需求设置节点类型
      data: {
        label: `${data.nodes.length + 1}`,
        toolbarPosition: Position.Top,
        content: `    <p data-id="f99782f9-0b52-4494-9484-2e0a17fbad83"><strong>（三）宮變與晉國內鬥</strong></p>
    <p data-id="8eb717c4-742a-4403-a55e-946352caeec8">
        呂、郤二人因畏懼逼近，圖謀焚燒公宮，弒殺晉侯。當時寺中人前來披露情形，要求見面，重耳派人推辭並告辭說：“在蒲城之役中，您只命令我留宿一夜，女子便迅速到達；此後我隨狄君到田渭濱，您又命令女子三宿待命，結果女子卻提前到來。即使有您的命令，也怎能這般急促？驅逐的命令仍在，您請隨我離去吧。”對方答道：“臣認為您這次入國，其意圖已昭然於心；如果還未完全成功，將來必然遇到更大艱難。君的命令不可更改，這是古制；除去君的過錯，剩下的只能看實力。蒲城人、狄人我又怎能依靠？如今君已即位，難道國內就沒有蒲城與狄族的人嗎？就如齊桓公設置射鉤、任用管仲，若您輕易更改命令，豈不辱沒了君命？您麾下行動之人眾多，難道只靠刑罰就能對付他們？”重耳見狀，便以此為難向外通報。三月，晉侯秘密在王城與秦伯會面；己丑晦日，晉侯的宮殿失火，瑕甥與郤芮未能趕到公宮，便到河邊，秦伯便設計誘捕並殺害了他們。晉侯隨後將夫人贏氏奪回晉國，而秦伯則送來三千名衛國士卒，實際上是作為紀綱的奴僕。
    </p>
    <p data-id="2c6a98c4-af0c-4aa8-83e3-18c72fdb1157">
        起初，晉侯身邊有個外號“豎頭須”的隨從，專管藏物。每當晉侯出行時，他便暗中把藏品藏起來，等到入境後，再以此求得重耳納接。重耳入晉後，要求見面，重耳以要沐浴為由推辭，並告訴僕人說：“沐浴會使人心神不寧，心神不寧便會生起反叛之心；所以，我不宜見他。守宮者是保衛國家社稷的，而出行者是受羈縻的僕從，這樣也可，何必懲罰那些守宮的人呢？如今國君對平民與敵對之輩均懷戒心，恐懼者已多。”僕人告知後，重耳急忙前去見那人。
    </p>
    <p data-id="da2a9edf-85fe-44fc-bb54-d717bf06be15">
        狄人將季隗送回晉國時，還要求帶回她的兩個兒子。晉文公之妻趙衰曾生下原同、屏括、樓嬰；後來，趙姬要求讓盾與其母一同反叛，而子余則推辭。趙姬責備道：“既然得寵就忘了舊情，如何能使人效忠？他必然會反叛。”最終她堅持要求，並得到了允許。來後，趙姬以盾為主張，一再請求重耳承認盾為嫡子，並命令其三個兒子在繼承順位上服從，同時安排叔隗作為內室，與她相並。
    </p>
    <p data-id="880f837c-67ac-4051-90ea-32b898e3f1a8">
        晉侯對隨從中喪命者進行獎賞，其中介之推卻不肯提及俸祿，結果連俸祿也未及。介之推說：“獻公的九個兒子中，只有您還在；惠侯、懷侯都無親信，內外皆被棄用。天道尚未絕望晉國，必然會有新主出現。主持晉國祭祀的人，除了您還有誰？上天確已賦予您這使命，而您那二三子竟妄自稱功，這豈不是自欺欺人？盜取他人財物還說成是小偷，更何況貪圖上天之功而據為己有呢？對下懲罰義者，對上獎賞奸佞，官民上下皆蒙蔽，實在難以共處！”其母勸道：“何不去爭取呢？與其以死相抗，又有誰會追究？”介之推回答：“若我也這樣效仿，罪過就更大，而且發出怨言，反而連供飯都不肯吃。”其母又問：“那你打算如何讓他們知道？”他答：“言辭只不過是外在文采，身體將隱退，又何必費心去表現？這不正是追求顯赫嗎？”其母說：“你能如此堅持嗎？那就與我一同隱退吧。”兩人遂隱退並相繼去世。晉侯曾四處尋求，但未能尋得他；於是便將綿上分給他作為田地，並說：“以此記我過，亦彰顯善人之德。”
    </p>`,
        nodes: data.nodes,
        setNodes: data.setNodes,
      },
    };

    data.setNodes((nds) => [...nds, newNodeA, newNodeB, newNodeC]);
  };

  const handleWait = () => {
    setWait((prev) => !prev);
    setTimeout(() => {
      setWait((prev) => !prev);
      setAiUseOpen(false);
      handleGenerateContant();
    }, 2000);
  };

  return (
    <div className="size-max overflow-hidden">
      <Handle
        type="target"
        position={Position.Left}
        onConnect={(params) => console.log("handle onConnect", params)}
        isConnectable={isConnectable}
      />
      <div className="w-full h-full bg-white pt-2 px-2 flex">
        <Popover open={aiUseOpen} onOpenChange={setAiUseOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" onClick={() => setAiUseOpen(true)}>
              <Bot className=" hover:text-red-500 text-2xl" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="size-max">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">
                  What can I do for you?
                </h4>
                <p className="text-sm text-muted-foreground">
                  You can use an AI assistant to help you
                </p>
              </div>
              <div className="grid gap-2">
                <div className="bg-white flex justify-center items-center gap-1">
                  <Textarea
                    className=""
                    placeholder="Type your message here."
                  />
                  <Button
                    disabled={wait}
                    className=" rounded-md h-12 w-12  p-2"
                    onClick={() => {
                      handleWait(); // 在點擊按鈕後，關閉 Popover
                    }}
                  >
                    {wait ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <Send className=" text-white" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Popover open={wordExportOpen} onOpenChange={setWordExportOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" onClick={() => setWordExportOpen(true)}>
              <FaFileWord className=" hover:text-red-500 text-2xl" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="size-max">
            <div className="grid gap-4">
              <div className="space-y-2 text-center">
                <h4 className="font-medium leading-none ">
                  Can Support Export to Doc{" "}
                </h4>
                <p className="text-sm text-muted-foreground">
                  You can click button and download Doc
                </p>
              </div>
              <div className="grid gap-2">
                <div className="bg-white flex justify-center items-center gap-1">
                  <Button
                    disabled={wait}
                    className=" rounded-md h-12 w-12  p-2"
                  >
                    {wait ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <Download className=" text-white" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Popover open={pdfExportOpen} onOpenChange={setPdfExportOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" onClick={() => setPdfExportOpen(true)}>
              <FaFilePdf className=" hover:text-red-500 text-2xl" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="size-max">
            <div className="grid gap-4">
              <div className="space-y-2 text-center">
                <h4 className="font-medium leading-none">
                  Can Support Export to PDF
                </h4>
                <p className="text-sm text-muted-foreground">
                  You can click button and download PDF
                </p>
              </div>
              <div className="grid gap-2">
                <div className="bg-white flex justify-center items-center gap-1">
                  <Button
                    disabled={wait}
                    className=" rounded-md h-12 w-12  p-2"
                  >
                    {wait ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <Download className=" text-white" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <Editor className="nodrag bg-white" data={data} />

      <Handle
        type="source"
        position={Position.Right}
        id="a"
        isConnectable={isConnectable}
      />
    </div>
  );
});
