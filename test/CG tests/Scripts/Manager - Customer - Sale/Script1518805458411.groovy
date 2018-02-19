import static com.kms.katalon.core.checkpoint.CheckpointFactory.findCheckpoint
import static com.kms.katalon.core.testcase.TestCaseFactory.findTestCase
import static com.kms.katalon.core.testdata.TestDataFactory.findTestData
import static com.kms.katalon.core.testobject.ObjectRepository.findTestObject
import com.kms.katalon.core.checkpoint.Checkpoint as Checkpoint
import com.kms.katalon.core.checkpoint.CheckpointFactory as CheckpointFactory
import com.kms.katalon.core.mobile.keyword.MobileBuiltInKeywords as MobileBuiltInKeywords
import com.kms.katalon.core.mobile.keyword.MobileBuiltInKeywords as Mobile
import com.kms.katalon.core.model.FailureHandling as FailureHandling
import com.kms.katalon.core.testcase.TestCase as TestCase
import com.kms.katalon.core.testcase.TestCaseFactory as TestCaseFactory
import com.kms.katalon.core.testdata.TestData as TestData
import com.kms.katalon.core.testdata.TestDataFactory as TestDataFactory
import com.kms.katalon.core.testobject.ObjectRepository as ObjectRepository
import com.kms.katalon.core.testobject.TestObject as TestObject
import com.kms.katalon.core.webservice.keyword.WSBuiltInKeywords as WSBuiltInKeywords
import com.kms.katalon.core.webservice.keyword.WSBuiltInKeywords as WS
import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUiBuiltInKeywords
import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI
import internal.GlobalVariable as GlobalVariable
import org.openqa.selenium.Keys as Keys

WebUI.openBrowser('')

WebUI.navigateToUrl('http://127.0.0.1:8100/#/app/login')

WebUI.click(findTestObject('Page_Log In/ion-content_Scan to sign in'))

WebUI.click(findTestObject('Page_Log In/ion-content_Scan to sign in'))

WebUI.click(findTestObject('Page_Log In/button_Scan to sign in'))

WebUI.click(findTestObject('Page_Scan Barcode/img_demoImages'))

WebUI.click(findTestObject('Page_Home/button_Scan CGPay Card'))

WebUI.click(findTestObject('Page_Scan Barcode/img_demoImages_1'))

WebUI.click(findTestObject('Page_Customer Menu/button_Charge'))

WebUI.click(findTestObject('Page_Transaction/td_1'))

WebUI.click(findTestObject('Page_Transaction/td_2'))

WebUI.click(findTestObject('Page_Transaction/td_3'))

WebUI.click(findTestObject('Page_Transaction/button_Charge'))

WebUI.click(findTestObject('Page_Transaction Results/button_Home'))

WebUI.click(findTestObject('Page_Home/button_button button-icon butt'))

WebUI.click(findTestObject('Page_Home/ion-item_Advanced Settings'))

WebUI.click(findTestObject('Page_Preferences/div_Change Company'))

WebUI.click(findTestObject('Page_Preferences/button_Confirm'))

not_run: WebUI.closeBrowser()

