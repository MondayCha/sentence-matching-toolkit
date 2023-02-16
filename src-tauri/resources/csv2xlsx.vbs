'创建一个Excel应用程序对象
Set xlApp = CreateObject("Excel.Application")

'设置Excel为不可见
xlApp.Visible = False
xlApp.DisplayAlerts = False

'save csv file name to variable
csvFile = WScript.Arguments(0)

'打开你的csv文件
Set xlBook = xlApp.Workbooks.Open(csvFile)

'另存为xlsm文件
xlBook.SaveAs Replace(csvFile, ".csv", ".xlsm"), 52

'添加宏
Set module1 = xlBook.VBProject.VBComponents.Add(1)

'设置宏代码
theSource = ""
theSource = theSource & "Sub MarkColor()" & vbCrLf
theSource = theSource & "    Dim currentRow As Long" & vbCrLf
theSource = theSource & "    Dim startCol As Integer" & vbCrLf
theSource = theSource & "    Dim endCol As Integer" & vbCrLf
theSource = theSource & "    Dim keyCol As Integer" & vbCrLf
theSource = theSource & "    Dim endRow As Integer" & vbCrLf
theSource = theSource & "    startCol = 1" & vbCrLf
theSource = theSource & "    endCol = 6" & vbCrLf
theSource = theSource & "    keyCol = 3" & vbCrLf
theSource = theSource & "    endRow = Range(""A"" & Rows.Count).End(xlUp).Row" & vbCrLf
theSource = theSource & "" & vbCrLf
theSource = theSource & "" & vbCrLf
theSource = theSource & "    Range(""A1:F"" & endRow).Select" & vbCrLf
theSource = theSource & "    With Selection.Font" & vbCrLf
theSource = theSource & "        .Name = ""宋体""" & vbCrLf
theSource = theSource & "        .Size = 11" & vbCrLf
theSource = theSource & "        .Strikethrough = False" & vbCrLf
theSource = theSource & "        .Superscript = False" & vbCrLf
theSource = theSource & "        .Subscript = False" & vbCrLf
theSource = theSource & "        .OutlineFont = False" & vbCrLf
theSource = theSource & "        .Shadow = False" & vbCrLf
theSource = theSource & "        .Underline = xlUnderlineStyleNone" & vbCrLf
theSource = theSource & "        .TintAndShade = 0" & vbCrLf
theSource = theSource & "        .ThemeFont = xlThemeFontNone" & vbCrLf
theSource = theSource & "    End With" & vbCrLf
theSource = theSource & "" & vbCrLf
theSource = theSource & "    Cells.EntireColumn.ColumnWidth = 8.11" & vbCrLf
theSource = theSource & "    Cells.EntireColumn.AutoFit" & vbCrLf
theSource = theSource & "" & vbCrLf
theSource = theSource & "    Range(""A1:F"" & endRow).Select" & vbCrLf
theSource = theSource & "    With Selection" & vbCrLf
theSource = theSource & "        .HorizontalAlignment = xlCenter" & vbCrLf
theSource = theSource & "        .VerticalAlignment = xlCenter" & vbCrLf
theSource = theSource & "        .WrapText = False" & vbCrLf
theSource = theSource & "        .Orientation = 0" & vbCrLf
theSource = theSource & "        .AddIndent = False" & vbCrLf
theSource = theSource & "        .IndentLevel = 0" & vbCrLf
theSource = theSource & "        .ShrinkToFit = False" & vbCrLf
theSource = theSource & "        .ReadingOrder = xlContext" & vbCrLf
theSource = theSource & "        .MergeCells = False" & vbCrLf
theSource = theSource & "    End With" & vbCrLf
theSource = theSource & "" & vbCrLf
theSource = theSource & "    Range(""A1:F"" & endRow).Select" & vbCrLf
theSource = theSource & "    Selection.Borders(xlDiagonalDown).LineStyle = xlNone" & vbCrLf
theSource = theSource & "    Selection.Borders(xlDiagonalUp).LineStyle = xlNone" & vbCrLf
theSource = theSource & "    With Selection.Borders(xlEdgeLeft)" & vbCrLf
theSource = theSource & "        .LineStyle = xlContinuous" & vbCrLf
theSource = theSource & "        .ColorIndex = 0" & vbCrLf
theSource = theSource & "        .TintAndShade = 0" & vbCrLf
theSource = theSource & "        .Weight = xlThin" & vbCrLf
theSource = theSource & "    End With" & vbCrLf
theSource = theSource & "    With Selection.Borders(xlEdgeTop)" & vbCrLf
theSource = theSource & "        .LineStyle = xlContinuous" & vbCrLf
theSource = theSource & "        .ColorIndex = 0" & vbCrLf
theSource = theSource & "        .TintAndShade = 0" & vbCrLf
theSource = theSource & "        .Weight = xlThin" & vbCrLf
theSource = theSource & "    End With" & vbCrLf
theSource = theSource & "    With Selection.Borders(xlEdgeBottom)" & vbCrLf
theSource = theSource & "        .LineStyle = xlContinuous" & vbCrLf
theSource = theSource & "        .ColorIndex = 0" & vbCrLf
theSource = theSource & "        .TintAndShade = 0" & vbCrLf
theSource = theSource & "        .Weight = xlThin" & vbCrLf
theSource = theSource & "    End With" & vbCrLf
theSource = theSource & "    With Selection.Borders(xlEdgeRight)" & vbCrLf
theSource = theSource & "        .LineStyle = xlContinuous" & vbCrLf
theSource = theSource & "        .ColorIndex = 0" & vbCrLf
theSource = theSource & "        .TintAndShade = 0" & vbCrLf
theSource = theSource & "        .Weight = xlThin" & vbCrLf
theSource = theSource & "    End With" & vbCrLf
theSource = theSource & "    With Selection.Borders(xlInsideVertical)" & vbCrLf
theSource = theSource & "        .LineStyle = xlContinuous" & vbCrLf
theSource = theSource & "        .ColorIndex = 0" & vbCrLf
theSource = theSource & "        .TintAndShade = 0" & vbCrLf
theSource = theSource & "        .Weight = xlThin" & vbCrLf
theSource = theSource & "    End With" & vbCrLf
theSource = theSource & "    With Selection.Borders(xlInsideHorizontal)" & vbCrLf
theSource = theSource & "        .LineStyle = xlContinuous" & vbCrLf
theSource = theSource & "        .ColorIndex = 0" & vbCrLf
theSource = theSource & "        .TintAndShade = 0" & vbCrLf
theSource = theSource & "        .Weight = xlThin" & vbCrLf
theSource = theSource & "    End With" & vbCrLf
theSource = theSource & "" & vbCrLf
theSource = theSource & "    Range(""A1:F1"").Select" & vbCrLf
theSource = theSource & "    With Selection.Interior" & vbCrLf
theSource = theSource & "        .Pattern = xlSolid" & vbCrLf
theSource = theSource & "        .PatternColorIndex = xlAutomatic" & vbCrLf
theSource = theSource & "        .ThemeColor = xlThemeColorAccent6" & vbCrLf
theSource = theSource & "        .TintAndShade = -0.249977111117893" & vbCrLf
theSource = theSource & "        .PatternTintAndShade = 0" & vbCrLf
theSource = theSource & "    End With" & vbCrLf
theSource = theSource & "    With Selection.Font" & vbCrLf
theSource = theSource & "        .ThemeColor = xlThemeColorDark1" & vbCrLf
theSource = theSource & "        .TintAndShade = 0" & vbCrLf
theSource = theSource & "    End With" & vbCrLf
theSource = theSource & "    Selection.Font.Bold = True" & vbCrLf
theSource = theSource & "    Rows(""1:1"").RowHeight = 21.8" & vbCrLf
theSource = theSource & "" & vbCrLf
theSource = theSource & "    " & vbCrLf
theSource = theSource & "    For currentRow = 2 To 2000" & vbCrLf
theSource = theSource & "        If Trim(Cells(currentRow, startCol).Value) <> """" Then" & vbCrLf
theSource = theSource & "            sRng = Cells(currentRow, startCol).Address & "":"" & Cells(currentRow, endCol).Address" & vbCrLf
theSource = theSource & "            If Trim(Cells(currentRow, keyCol).Value) = Trim(Cells(currentRow - 1, keyCol).Value) Then" & vbCrLf
theSource = theSource & "                Range(sRng).Select" & vbCrLf
theSource = theSource & "                If currentRow = 2 Then" & vbCrLf
theSource = theSource & "                    Selection.Interior.Color = RGB(255, 255, 255)" & vbCrLf
theSource = theSource & "                Else" & vbCrLf
theSource = theSource & "                    Selection.Interior.Color = Cells(currentRow - 1, startCol).Interior.Color" & vbCrLf
theSource = theSource & "                End If" & vbCrLf
theSource = theSource & "            Else" & vbCrLf
theSource = theSource & "                Range(sRng).Select" & vbCrLf
theSource = theSource & "                If Cells(currentRow - 1, startCol).Interior.Color = RGB(255, 255, 255) Then" & vbCrLf
theSource = theSource & "                    Selection.Interior.Color = RGB(226, 239, 218)" & vbCrLf
theSource = theSource & "                Else" & vbCrLf
theSource = theSource & "                    Selection.Interior.Color = RGB(255, 255, 255)" & vbCrLf
theSource = theSource & "                End If" & vbCrLf
theSource = theSource & "            End If" & vbCrLf
theSource = theSource & "        Else" & vbCrLf
theSource = theSource & "            Exit For" & vbCrLf
theSource = theSource & "        End If" & vbCrLf
theSource = theSource & "    Next" & vbCrLf
theSource = theSource & "" & vbCrLf
theSource = theSource & "    Range(""A1"").Select" & vbCrLf
theSource = theSource & "    With ActiveWindow" & vbCrLf
theSource = theSource & "        .SplitColumn = 0" & vbCrLf
theSource = theSource & "        .SplitRow = 1" & vbCrLf
theSource = theSource & "    End With" & vbCrLf
theSource = theSource & "    ActiveWindow.FreezePanes = True" & vbCrLf
theSource = theSource & "End Sub" & vbCrLf

module1.CodeModule.AddFromString theSource
xlBook.Save

'运行宏
xlApp.Run "MarkColor"
xlBook.Save

'另存为xlsx文件
xlBook.SaveAs Replace(csvFile, ".csv", ".xlsx"), 51

'关闭你的工作簿和Excel应用程序
xlBook.Close
xlApp.Quit

set xlApp = Nothing
set xlBook = Nothing